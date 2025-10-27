import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MCPChatbotService } from "./mcp-server.js";

dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3001;

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "mcp-server" });
});

// Main chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const authorization = req.headers.authorization || "";
    console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:", req.headers);
    console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
    console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
    console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
    console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
    console.log("-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:");
    console.log("MCP Server received chat request:", {
      message: req.body.message,
      product_id: req.body.product_id,
      user_id: req.body.user_id,
      authorization: authorization,
    });

    // Forward cookies to the MCP service
    const response = await MCPChatbotService.processChat(
      req.body,
      authorization
    );

    console.log("MCP Server sending response:", response);
    res.json(response);
  } catch (error: any) {
    console.error("MCP Server Error:", error);
    res.status(500).json({
      error: error.message,
      reply: "Sorry, I encountered an error. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ MCP HTTP server running on http://localhost:${PORT}`);
  console.log(
    `📡 Backend API URL: ${
      process.env.BACKEND_API_URL || "http://localhost:3000"
    }`
  );
});
