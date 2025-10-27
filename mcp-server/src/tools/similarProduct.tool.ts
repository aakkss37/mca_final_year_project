import { ProductService } from "../services/product.service.js";
import { ChatAction, Product } from "../types/index.js";
import { Logger } from "../utils/logger.js";

/**
 * Handle get_similar_products tool execution
 * @param args - Function arguments from OpenAI
 * @param product_id - Current product ID from context
 * @returns Response message and action
 */
export async function handleSimilarProducts(
  args: any,
  product_id?: string
): Promise<{ reply: string; action?: ChatAction }> {
  const targetProductId = args.product_id || product_id;

  if (!targetProductId) {
    Logger.warn("Similar products called without product_id");
    return {
      reply: "Sorry, I need a product to find similar items.",
    };
  }

  try {
    const similarProducts = await ProductService.getSimilarProducts(
      targetProductId
    );

    if (similarProducts.length === 0) {
      return {
        reply: "Sorry, I couldn't find similar products at the moment.",
      };
    }

    const productList = similarProducts
      .slice(0, 5)
      .map(
        (p: Product, i: number) =>
          `${i + 1}. ${p.title} - $${p.price} (Rating: ${p.rating}/5)`
      )
      .join("\n");

    return {
      reply: `Here are some similar products:\n\n${productList}`,
      action: {
        type: "navigate",
        payload: {
          similarProducts: similarProducts,
        },
      },
    };
  } catch (error: any) {
    Logger.error("Similar products tool error", error);
    return {
      reply:
        "Sorry, there was an error finding similar products. Please try again.",
    };
  }
}
