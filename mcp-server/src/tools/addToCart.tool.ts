import { CartService } from "../services/cart.service.js";
import { ChatAction } from "../types/index.js";
import { Logger } from "../utils/logger.js";

/**
 * Handle add_to_cart tool execution
 * @param args - Function arguments from OpenAI
 * @param context - Execution context (user_id, product_id, authorization)
 * @returns Response message and action
 */
export async function handleAddToCart(
  args: any,
  context: {
    user_id?: string;
    product_id?: string;
    authorization: string;
  }
): Promise<{ reply: string; action?: ChatAction }> {
  const targetProductId = args.product_id || context.product_id;
  const quantity = args.quantity || 1;

  if (!targetProductId) {
    Logger.warn("Add to cart called without product_id");
    return {
      reply: "Sorry, I need a product to add to cart.",
    };
  }

  // Handle guest users
  if (!context.user_id) {
    Logger.info("Creating guest cart action");
    const payload = CartService.createGuestCartPayload(
      targetProductId,
      quantity
    );

    return {
      reply: `I'll add ${quantity} ${
        quantity > 1 ? "items" : "item"
      } to your cart!`,
      action: {
        type: "add_to_cart",
        payload: payload,
      },
    };
  }

  // Handle logged-in users
  const payload = await CartService.addToCart(
    context.user_id,
    targetProductId,
    quantity,
    context.authorization
  );

  if (payload.success) {
    return {
      reply: `Great! I've added ${quantity} ${
        quantity > 1 ? "items" : "item"
      } to your cart. You can view your cart anytime!`,
      action: {
        type: "add_to_cart",
        payload: payload,
      },
    };
  } else {
    return {
      reply:
        "Sorry, there was an error adding the product to your cart. Please try again or add it manually.",
      action: {
        type: "add_to_cart",
        payload: payload,
      },
    };
  }
}
