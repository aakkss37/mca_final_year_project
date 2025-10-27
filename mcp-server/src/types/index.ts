/**
 * Chat message interface for conversation history
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Incoming chat request from main backend
 */
export interface ChatRequest {
  message: string;
  product_id?: string;
  user_id?: string;
  conversation_history?: ChatMessage[];
}

/**
 * Chat response with optional action
 */
export interface ChatResponse {
  reply: string;
  action?: ChatAction;
}

/**
 * Action that can be triggered by the chatbot
 */
export interface ChatAction {
  type: "add_to_cart" | "navigate" | "search";
  payload?: any;
}

/**
 * Product entity from database
 */
export interface Product {
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

/**
 * Add to cart action payload
 */
export interface AddToCartPayload {
  product_id: string;
  quantity: number;
  success?: boolean;
  isGuest?: boolean;
  error?: string;
}

/**
 * Search products parameters
 */
export interface SearchProductsParams {
  title?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}
