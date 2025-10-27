import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

/**
 * OpenAI client configuration
 * Initialized with API key from environment variables
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * OpenAI model configuration
 */
export const OPENAI_CONFIG = {
  model: "gpt-4o-mini" as const,
  temperature: 0.7,
  maxTokens: 500,
};

/**
 * Backend API URL for making requests to main server
 */
export const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:3000";
