import axios from "axios";
import { BACKEND_API_URL } from "../config/openai.config.js";
import { AddToCartPayload } from "../types/index.js";
import { Logger } from "../utils/logger.js";

/**
 * Service for handling cart operations
 */
export class CartService {
  /**
   * Add a product to user's cart
   * @param user_id - UUID of the user
   * @param product_id - UUID of the product to add
   * @param quantity - Quantity to add (default: 1)
   * @param authorization - JWT authorization header
   * @returns Action payload with success status
   */
  static async addToCart(
    user_id: string,
    product_id: string,
    quantity: number,
    authorization: string
  ): Promise<AddToCartPayload> {
    try {
      Logger.info(
        `Adding to cart: user=${user_id}, product=${product_id}, qty=${quantity}`
      );

      await axios.post(
        `${BACKEND_API_URL}/cart/${user_id}`,
        {
          product_id: product_id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
          },
        }
      );

      Logger.success("Product added to cart successfully");

      return {
        product_id: product_id,
        quantity: quantity,
        success: true,
      };
    } catch (error: any) {
      Logger.error("Failed to add product to cart", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      return {
        product_id: product_id,
        quantity: quantity,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create guest cart action payload
   * @param product_id - UUID of the product
   * @param quantity - Quantity to add
   * @returns Action payload for guest users
   */
  static createGuestCartPayload(
    product_id: string,
    quantity: number
  ): AddToCartPayload {
    Logger.info(`Creating guest cart payload for product: ${product_id}`);

    return {
      product_id: product_id,
      quantity: quantity,
      isGuest: true,
    };
  }
}
