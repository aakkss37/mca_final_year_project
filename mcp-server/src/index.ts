import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatbotService } from "./services/chatbot.service.js";
import { Logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_PROD_URL
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

/**
 * Health check endpoint
 * GET /health
 */
app.get("/health", (req, res) => {
  Logger.info("Health check requested");
  res.json({
    status: "ok",
    service: "mcp-server",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main chat endpoint for AI conversations
 * POST /chat
 * Body: { message, product_id?, user_id?, conversation_history? }
 * Headers: { Authorization, Cookie }
 */
app.post("/chat", async (req, res) => {
  try {
    Logger.info("Chat request received", {
      message: req.body.message?.substring(0, 50),
      hasProductId: !!req.body.product_id,
      hasUserId: !!req.body.user_id,
    });

    // Extract authorization headers
    const authHeader = req.headers.authorization || "";
    const cookieHeader = req.headers.cookie || "";

    if (!authHeader && req.body.user_id) {
      Logger.warn("Authenticated request missing Authorization header");
    }

    // Process chat through chatbot service
    const response = await ChatbotService.processChat(req.body, authHeader);

    Logger.success("Chat response sent");
    res.json(response);
  } catch (error: any) {
    Logger.error("Chat endpoint error", error);
    res.status(500).json({
      error: error.message,
      reply: "Sorry, I encountered an error. Please try again.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  Logger.success(`MCP HTTP server running on http://localhost:${PORT}`);
  Logger.info(
    `Backend API URL: ${process.env.BACKEND_API_URL || "http://localhost:3000"}`
  );
});
