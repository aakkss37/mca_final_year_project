import axios from "axios";
import { BACKEND_API_URL } from "../config/openai.config.js";
import { Product, SearchProductsParams } from "../types/index.js";
import { Logger } from "../utils/logger.js";

/**
 * Service for handling product-related operations
 */
export class ProductService {
  /**
   * Fetch product details by ID
   * @param product_id - UUID of the product
   * @returns Product details
   */
  static async getProductDetails(product_id: string): Promise<Product> {
    try {
      Logger.debug(`Fetching product details for: ${product_id}`);
      const response = await axios.get(
        `${BACKEND_API_URL}/product/${product_id}`
      );
      return response.data.product;
    } catch (error: any) {
      Logger.error("Failed to fetch product details", error.message);
      throw error;
    }
  }

  /**
   * Search products based on various filters
   * @param params - Search parameters (title, category, brand, price range)
   * @returns Array of matching products
   */
  static async searchProducts(
    params: SearchProductsParams,
    authorization: string
  ): Promise<Product[]> {
    try {
      Logger.debug("Searching products with params:", params);

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
        `${BACKEND_API_URL}/product?${queryParams.toString()}`,
        {
          headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
          },
        }
      );

      Logger.info(`Found ${response.data.products.length} products`);
      return response.data.products;
    } catch (error: any) {
      Logger.error("Failed to search products", error.message);
      throw error;
    }
  }

  /**
   * Find similar products based on category and price range
   * @param product_id - UUID of the reference product
   * @returns Array of similar products
   */
  static async getSimilarProducts(product_id: string): Promise<Product[]> {
    try {
      Logger.debug(`Finding similar products for: ${product_id}`);

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

      // Filter out the original product
      const similarProducts = response.data.products.filter(
        (p: Product) => p.product_id !== product_id
      );

      Logger.info(`Found ${similarProducts.length} similar products`);
      return similarProducts;
    } catch (error: any) {
      Logger.error("Failed to find similar products", error.message);
      throw error;
    }
  }

  /**
   * Build product context string for AI prompt
   * @param product - Product details
   * @returns Formatted product context string
   */
  static buildProductContext(product: Product): string {
    return `
Current Product Context:
- Product ID: ${product.product_id}
- Name: ${product.title}
- Description: ${product.description || "No description available"}
- Price: $${product.price}
- Category: ${product.category}
- Brand: ${product.brand || "N/A"}
- Rating: ${product.rating}/5
- Stock: ${product.stock} units available
`;
  }
}
