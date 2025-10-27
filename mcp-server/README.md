# E-commerce MCP Server

This is a Model Context Protocol (MCP) server for the e-commerce chatbot, providing AI-powered product assistance and cart management.

## Features

- **Product Context Management**: Set and retrieve product information for conversations
- **Product Details**: Get comprehensive product information
- **Add to Cart**: Handle cart operations through natural language
- **Product Search**: Search for products by various criteria
- **Similar Products**: Find similar products based on category and price

## Setup

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `mcp-server` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
BACKEND_API_URL=http://localhost:3000
PORT=3001
```

### 3. Build and Run

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

## MCP Tools

### set_product_context

Set the current product context for the conversation.

- **Input**: `product_id` (string)
- **Use**: Call this when a user opens a product page

### get_product_details

Get detailed information about the current product.

- **Input**: None (uses current context)
- **Use**: Answer questions about product specifications

### add_to_cart

Add the current product to the user's cart.

- **Input**: `quantity` (number), `user_id` (optional string)
- **Use**: When user says "add to cart", "buy this", etc.

### search_products

Search for products by various criteria.

- **Input**: `title`, `category`, `brand`, `minPrice`, `maxPrice`
- **Use**: When user asks to find or search for products

### get_similar_products

Find similar products to the current product.

- **Input**: None (uses current context)
- **Use**: When user asks for alternatives or similar items

## Integration with Backend

The MCP server communicates with your backend API at `http://localhost:3000` (configurable via `BACKEND_API_URL`).

Make sure your backend server is running before starting the MCP server.

## Architecture

```
Client (Frontend)
    ↓
Backend API (/chatbot/chat endpoint)
    ↓
OpenAI GPT-4 with MCP Tools
    ↓
MCP Server (product context & cart operations)
    ↓
Backend API (product & cart endpoints)
```

## Testing

You can test the MCP server using the inspector:

```bash
npm run inspector
```

This will help you test individual tools and their responses.

## Notes

- The server runs on stdio transport for MCP communication
- All errors are logged to stderr
- Product context is maintained per session
- Guest users receive product info to add to local storage cart
- Logged-in users have products added directly to their database cart
