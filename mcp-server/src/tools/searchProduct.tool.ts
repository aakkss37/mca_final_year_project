import { ProductService } from "../services/product.service.js";
import { ChatAction, Product } from "../types/index.js";
import { Logger } from "../utils/logger.js";

/**
 * Handle search_products tool execution
 * @param args - Function arguments from OpenAI
 * @param authorization - JWT authorization header
 * @returns Response message and action
 */
export async function handleSearchProducts(
  args: any,
  authorization: string
): Promise<{
  reply: string;
  action?: ChatAction;
}> {
  try {
    const searchResults = await ProductService.searchProducts(
      args,
      authorization
    );

    if (searchResults.length === 0) {
      return {
        reply: "Sorry, I couldn't find any products matching your search.",
      };
    }

    const productList = searchResults
      .slice(0, 5)
      .map(
        (p: Product, i: number) =>
          `${i + 1}. ${p.title} - $${p.price} (Rating: ${p.rating}/5)`
      )
      .join("\n");

    return {
      reply: `I found ${searchResults.length} product${
        searchResults.length > 1 ? "s" : ""
      }:\n\n${productList}${
        searchResults.length > 5 ? "\n\n...and more!" : ""
      }`,
      action: {
        type: "search",
        payload: searchResults,
      },
    };
  } catch (error: any) {
    Logger.error("Search products tool error", error);
    return {
      reply:
        "Sorry, there was an error searching for products. Please try again.",
    };
  }
}
