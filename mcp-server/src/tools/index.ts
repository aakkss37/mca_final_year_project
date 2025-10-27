import OpenAI from "openai";

/**
 * OpenAI function calling tools for the chatbot
 * These tools allow the AI to perform specific actions
 */
export const tools: OpenAI.Chat.ChatCompletionTool[] = [
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
