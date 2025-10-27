import OpenAI from "openai";
import { openai, OPENAI_CONFIG } from "../config/openai.config.js";
import { ProductService } from "./product.service.js";
import { tools } from "../tools/index.js";
import { handleAddToCart } from "../tools/addToCart.tool.js";
import { handleSearchProducts } from "../tools/searchProduct.tool.js";
import { handleSimilarProducts } from "../tools/similarProduct.tool.js";
import { ChatRequest, ChatResponse } from "../types/index.js";
import { Logger } from "../utils/logger.js";

/**
 * Main chatbot service for processing chat messages and executing tools
 */
export class ChatbotService {
  /**
   * Process a chat message with OpenAI and execute any triggered tools
   * @param chatRequest - Incoming chat request with message and context
   * @param authorization - JWT authorization header
   * @returns Chat response with reply and optional action
   */
  static async processChat(
    chatRequest: ChatRequest,
    authorization: string
  ): Promise<ChatResponse> {
    const {
      message,
      product_id,
      user_id,
      conversation_history = [],
    } = chatRequest;

    Logger.info("Processing chat message", {
      hasProductId: !!product_id,
      hasUserId: !!user_id,
      historyLength: conversation_history.length,
    });

    // Fetch and build product context if available
    let productContext = "";
    if (product_id) {
      try {
        const currentProduct = await ProductService.getProductDetails(
          product_id
        );
        productContext = ProductService.buildProductContext(currentProduct);
      } catch (error) {
        Logger.error("Failed to fetch product context", error);
      }
    }

    // Build system prompt with product context
    const systemPrompt = this.buildSystemPrompt(productContext);

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversation_history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    try {
      // Call OpenAI with function calling
      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages,
        tools,
        tool_choice: "auto",
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens,
      });

      const responseMessage = completion.choices[0].message;
      let reply =
        responseMessage.content || "Sorry, I could not process your request.";
      let action = undefined;

      // Handle function calls (tools)
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const result = await this.handleToolCalls(responseMessage.tool_calls, {
          user_id,
          product_id,
          authorization,
        });

        if (result) {
          reply = result.reply;
          action = result.action;
        }
      }

      Logger.success("Chat processed successfully");

      return { reply, action };
    } catch (error: any) {
      Logger.error("OpenAI API Error", error);
      throw new Error("Failed to process chat message. Please try again.");
    }
  }

  /**
   * Handle OpenAI tool calls by routing to appropriate handlers
   * @param toolCalls - Array of tool calls from OpenAI
   * @param context - Execution context (user_id, product_id, authorization)
   * @returns Combined response from tool execution
   */
  private static async handleToolCalls(
    toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[],
    context: {
      user_id?: string;
      product_id?: string;
      authorization: string;
    }
  ): Promise<{ reply: string; action?: any } | null> {
    // Process only the first tool call (can be extended for multiple)
    const toolCall = toolCalls[0];
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    Logger.debug(`Executing tool: ${functionName}`, functionArgs);

    switch (functionName) {
      case "add_to_cart":
        return await handleAddToCart(functionArgs, context);

      case "search_products":
        return await handleSearchProducts(functionArgs, context.authorization);

      case "get_similar_products":
        return await handleSimilarProducts(functionArgs, context.product_id);

      default:
        Logger.warn(`Unknown tool called: ${functionName}`);
        return null;
    }
  }

  /**
   * Build system prompt for the AI assistant
   * @param productContext - Optional product context to include
   * @returns System prompt string
   */
  private static buildSystemPrompt(productContext: string = ""): string {
    return `You are a helpful e-commerce shopping assistant. Your role is to:
1. Answer questions about products in a friendly and informative way
2. Help users find products they're looking for
3. Assist with adding products to cart when requested
4. Provide product recommendations

${productContext}

**IMPORTANT**: When a user expresses intent to purchase (e.g., "add to cart", "buy this", "I want this", "purchase"), you MUST call the add_to_cart function with the product_id.

Be conversational, helpful, and concise. If you don't have information, say so politely.`;
  }
}
