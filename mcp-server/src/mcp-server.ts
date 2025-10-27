import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3000";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  product_id?: string;
  user_id?: string;
  conversation_history?: ChatMessage[];
}

interface ChatResponse {
  reply: string;
  action?: {
    type: "add_to_cart" | "navigate" | "search";
    payload?: any;
  };
}

interface Product {
  product_id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  brand?: string;
  rating: number;
  stock: number;
  images?: string[];
}

export class MCPChatbotService {
  /**
   * Process chat message with MCP tools integration
   */
  public static async processChat(
    chatRequest: ChatRequest,
    authorization: string | string[]
  ): Promise<ChatResponse> {
    const {
      message,
      product_id,
      user_id,
      conversation_history = [],
    } = chatRequest;

    // Fetch product context if product_id is provided
    let productContext = "";
    let currentProduct: Product | null = null;

    if (product_id) {
      try {
        currentProduct = await this.getProductDetails(product_id);
        productContext = `
Current Product Context:
- Product ID: ${currentProduct.product_id}
- Name: ${currentProduct.title}
- Description: ${currentProduct.description || "No description available"}
- Price: $${currentProduct.price}
- Category: ${currentProduct.category}
- Brand: ${currentProduct.brand || "N/A"}
- Rating: ${currentProduct.rating}/5
- Stock: ${currentProduct.stock} units available
`;
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }

    // Define tools for OpenAI function calling
    const tools: OpenAI.Chat.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "add_to_cart",
          description:
            'Add the current product to the user\'s shopping cart. Use this when user says: "add to cart", "buy this", "purchase", "I want this", or similar intent.',
          parameters: {
            type: "object",
            properties: {
              product_id: {
                type: "string",
                description: "The UUID of the product to add",
              },
              quantity: {
                type: "number",
                description: "The quantity to add (default: 1)",
                default: 1,
              },
            },
            required: ["product_id"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_products",
          description:
            "Search for products by title, category, or brand. Use when user asks to find or search for products.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Search by product title",
              },
              category: {
                type: "string",
                description: "Filter by category",
              },
              brand: {
                type: "string",
                description: "Filter by brand",
              },
              minPrice: {
                type: "number",
                description: "Minimum price filter",
              },
              maxPrice: {
                type: "number",
                description: "Maximum price filter",
              },
            },
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_similar_products",
          description:
            "Find similar products to the current product based on category and price range.",
          parameters: {
            type: "object",
            properties: {
              product_id: {
                type: "string",
                description: "The product ID to find similar items for",
              },
            },
            required: ["product_id"],
          },
        },
      },
    ];

    // Build system prompt
    const systemPrompt = `You are a helpful e-commerce shopping assistant. Your role is to:
1. Answer questions about products in a friendly and informative way
2. Help users find products they're looking for
3. Assist with adding products to cart when requested
4. Provide product recommendations

${productContext}

**IMPORTANT**: When a user expresses intent to purchase (e.g., "add to cart", "buy this", "I want this", "purchase"), you MUST call the add_to_cart function with the product_id.

Be conversational, helpful, and concise. If you don't have information, say so politely.`;

    // Build messages array
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
        model: "gpt-4o-mini",
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 500,
      });

      const responseMessage = completion.choices[0].message;
      let reply =
        responseMessage.content || "Sorry, I could not process your request.";
      let action = undefined;

      // Handle function calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
          console.log(
            `Calling function############: ${functionName}`,
            functionArgs
          );
          console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
          console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
          console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
          console.log("Adding to cart with headers:", {
            authorization: authorization ? "Present" : "Missing",
            url: `${BACKEND_API_URL}/cart/${user_id}`,
          });
          console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
          if (functionName === "add_to_cart") {
            // Add to cart function
            const targetProductId = functionArgs.product_id || product_id;
            const quantity = functionArgs.quantity || 1;

            if (!targetProductId) {
              reply = "Sorry, I need a product to add to cart.";
              continue;
            }

            if (user_id) {
              // Call backend API to add to logged-in user's cart
              try {
                await axios.post(
                  `${BACKEND_API_URL}/cart/${user_id}`,
                  {
                    product_id: targetProductId,
                    quantity: quantity,
                  },
                  {
                    headers: {
                      Authorization: authorization, // Forward authentication cookies
                      "Content-Type": "application/json",
                    },
                  }
                );

                action = {
                  type: "add_to_cart" as const,
                  payload: {
                    product_id: targetProductId,
                    quantity: quantity,
                    success: true,
                  },
                };

                reply = `Great! I've added ${quantity} ${
                  quantity > 1 ? "items" : "item"
                } to your cart. You can view your cart anytime!`;
              } catch (error: any) {
                console.error("Error adding to cart:", error);
                reply =
                  "Sorry, there was an error adding the product to your cart. Please try again or add it manually.";
                action = {
                  type: "add_to_cart" as const,
                  payload: {
                    product_id: targetProductId,
                    quantity: quantity,
                    success: false,
                    error: error.message,
                  },
                };
              }
            } else {
              // For guest users, return product info to add to local cart
              action = {
                type: "add_to_cart" as const,
                payload: {
                  product_id: targetProductId,
                  quantity: quantity,
                  isGuest: true,
                },
              };

              reply = `I'll add ${quantity} ${
                quantity > 1 ? "items" : "item"
              } to your cart!`;
            }
          } else if (functionName === "search_products") {
            // Search products function
            try {
              const searchResults = await this.searchProducts(functionArgs);

              if (searchResults.length === 0) {
                reply =
                  "Sorry, I couldn't find any products matching your search.";
              } else {
                const productList = searchResults
                  .slice(0, 5)
                  .map(
                    (p: Product, i: number) =>
                      `${i + 1}. ${p.title} - $${p.price} (Rating: ${
                        p.rating
                      }/5)`
                  )
                  .join("\n");

                reply = `I found ${searchResults.length} product${
                  searchResults.length > 1 ? "s" : ""
                }:\n\n${productList}${
                  searchResults.length > 5 ? "\n\n...and more!" : ""
                }`;

                action = {
                  type: "search" as const,
                  payload: searchResults,
                };
              }
            } catch (error: any) {
              console.error("Error searching products:", error);
              reply =
                "Sorry, there was an error searching for products. Please try again.";
            }
          } else if (functionName === "get_similar_products") {
            // Get similar products function
            try {
              const targetProductId = functionArgs.product_id || product_id;

              if (!targetProductId) {
                reply = "Sorry, I need a product to find similar items.";
                continue;
              }

              const similarProducts = await this.getSimilarProducts(
                targetProductId
              );

              if (similarProducts.length === 0) {
                reply =
                  "Sorry, I couldn't find similar products at the moment.";
              } else {
                const productList = similarProducts
                  .slice(0, 5)
                  .map(
                    (p: Product, i: number) =>
                      `${i + 1}. ${p.title} - $${p.price} (Rating: ${
                        p.rating
                      }/5)`
                  )
                  .join("\n");

                reply = `Here are some similar products:\n\n${productList}`;

                action = {
                  type: "navigate" as const,
                  payload: {
                    similarProducts: similarProducts,
                  },
                };
              }
            } catch (error: any) {
              console.error("Error getting similar products:", error);
              reply =
                "Sorry, there was an error finding similar products. Please try again.";
            }
          }
        }
      }

      return {
        reply,
        action,
      };
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to process chat message. Please try again.");
    }
  }

  /**
   * Fetch product details from backend
   */
  private static async getProductDetails(product_id: string): Promise<Product> {
    const response = await axios.get(
      `${BACKEND_API_URL}/product/${product_id}`
    );
    return response.data.product;
  }

  /**
   * Search products from backend
   */
  private static async searchProducts(params: any): Promise<Product[]> {
    const queryParams = new URLSearchParams({
      offset: "0",
      limit: "10",
      sortBy: "rating",
      order: "DESC",
      minPrice: "0",
      minRating: "0",
    });

    if (params.title) queryParams.append("title", params.title);
    if (params.category) queryParams.append("categories", params.category);
    if (params.brand) queryParams.append("brand", params.brand);
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());

    const response = await axios.get(
      `${BACKEND_API_URL}/product?${queryParams.toString()}`
    );
    return response.data.products;
  }

  /**
   * Get similar products from backend
   */
  private static async getSimilarProducts(
    product_id: string
  ): Promise<Product[]> {
    const product = await this.getProductDetails(product_id);
    const priceRange = product.price * 0.3; // 30% price range

    const queryParams = new URLSearchParams({
      offset: "0",
      limit: "5",
      categories: product.category,
      sortBy: "rating",
      order: "DESC",
      minPrice: Math.max(0, product.price - priceRange).toString(),
      maxPrice: (product.price + priceRange).toString(),
      minRating: "0",
    });

    const response = await axios.get(
      `${BACKEND_API_URL}/product?${queryParams.toString()}`
    );
    return response.data.products.filter(
      (p: Product) => p.product_id !== product_id
    );
  }
}
