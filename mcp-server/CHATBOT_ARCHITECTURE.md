# AI-Powered Chatbot Architecture

## Overview

This document provides a comprehensive explanation of the AI-powered chatbot system integrated into our e-commerce platform. The chatbot uses OpenAI's GPT-4 with function calling (tools) to provide intelligent shopping assistance.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Breakdown](#component-breakdown)
3. [Detailed Flow Diagrams](#detailed-flow-diagrams)
4. [Authentication Flow](#authentication-flow)
5. [Tool Execution Flow](#tool-execution-flow)
6. [API Endpoints](#api-endpoints)
7. [Data Flow Examples](#data-flow-examples)
8. [Error Handling](#error-handling)
9. [Technology Stack](#technology-stack)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React App)                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Chatbot Component                                     │     │
│  │  - User Interface                                      │     │
│  │  - Message Display                                     │     │
│  │  - Input Handling                                      │     │
│  └────────────────────────────────────────────────────────┘     │
│                            │                                     │
│                            │ HTTP POST /chatbot/chat             │
│                            │ (with JWT token)                    │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN BACKEND (Express - Port 3000)           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Chatbot Controller & Service                          │     │
│  │  - Validates request                                   │     │
│  │  - Forwards to AI Chatbot Server                       │     │
│  │  - Returns response to client                          │     │
│  └────────────────────────────────────────────────────────┘     │
│                            │                                     │
│                            │ HTTP POST /chat                     │
│                            │ (with Authorization header)         │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              AI CHATBOT SERVER (Express - Port 3001)            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Chatbot Service                                       │     │
│  │  1. Fetch product context (if product_id provided)     │     │
│  │  2. Build AI prompt with context                       │     │
│  │  3. Call OpenAI with tools/functions                   │     │
│  │  4. Execute triggered tools                            │     │
│  │  5. Return formatted response                          │     │
│  └────────────────────────────────────────────────────────┘     │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                 │
│         ↓                  ↓                  ↓                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  Product    │   │    Cart     │   │   OpenAI    │          │
│  │  Service    │   │  Service    │   │     API     │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ↓                  ↓                  │
┌─────────────────────────────────────┐        │
│   MAIN BACKEND APIs (Port 3000)     │        │
│   - GET /product/:id                │        │
│   - GET /product (search)           │        │
│   - POST /cart/:user_id             │        │
└─────────────────────────────────────┘        │
                                               │
                                               ↓
                                    ┌──────────────────┐
                                    │  OpenAI GPT-4    │
                                    │  - Chat          │
                                    │  - Function Call │
                                    └──────────────────┘
```

---

## Component Breakdown

### 1. **Frontend - Chatbot Component** (`client/src/shared/components/Chatbot.component.tsx`)

**Responsibilities:**

- Render chat interface (messages, input, buttons)
- Manage conversation history
- Send user messages to backend
- Handle AI responses and actions
- Display loading states

**Key Features:**

- Real-time message updates
- Conversation history management
- Action handling (add to cart, navigate, etc.)
- Error display

---

### 2. **Main Backend - Chatbot Module** (`server/src/api/chatbot/`)

**Components:**

- **Router**: Defines `/chatbot/chat` endpoint
- **Controller**: Handles incoming requests
- **Service**: Forwards requests to AI Chatbot Server
- **Validator**: Validates request payload

**Responsibilities:**

- Request validation
- Authentication pass-through
- Proxy to AI Chatbot Server
- Error handling

---

### 3. **AI Chatbot Server** (`mcp-server/`)

#### **3.1 HTTP Server** (`src/index.ts`)

- Express server on port 3001
- `/health` - Health check endpoint
- `/chat` - Main chat endpoint

#### **3.2 Services**

##### **Chatbot Service** (`src/services/chatbot.service.ts`)

- Main orchestration layer
- Fetches product context
- Builds AI prompts
- Calls OpenAI API
- Routes tool execution
- Returns formatted responses

##### **Product Service** (`src/services/product.service.ts`)

- Fetch product details by ID
- Search products by filters
- Find similar products
- Build product context for AI

##### **Cart Service** (`src/services/cart.service.ts`)

- Add products to cart (logged-in users)
- Create guest cart payloads
- Handle cart errors

#### **3.3 Tools** (`src/tools/`)

Three tools available to the AI:

1. **Add to Cart** (`addToCart.tool.ts`)

   - Adds products to user's cart
   - Handles guest vs logged-in users
   - Returns success/failure status

2. **Search Products** (`searchProducts.tool.ts`)

   - Searches products by title, category, brand
   - Supports price range filters
   - Returns matching products

3. **Similar Products** (`similarProducts.tool.ts`)
   - Finds products in same category
   - Filters by similar price range (±30%)
   - Excludes original product

---

## Detailed Flow Diagrams

### Flow 1: Simple Question (No Tool Execution)

```
User: "What is this product?"

┌─────────────┐
│   Client    │
│ (Frontend)  │
└──────┬──────┘
       │ POST /chatbot/chat
       │ { message: "What is this product?",
       │   product_id: "abc-123",
       │   user_id: "user-456" }
       ↓
┌─────────────┐
│    Main     │
│  Backend    │
└──────┬──────┘
       │ POST /chat
       │ Headers: { Authorization: "Bearer token..." }
       ↓
┌─────────────────────────────────────────────┐
│          AI Chatbot Server                  │
│                                             │
│  1. Fetch product details (abc-123)        │
│     GET /product/abc-123                   │
│     → Returns product info                 │
│                                             │
│  2. Build context:                         │
│     "Current Product:                      │
│      - Name: iPhone 15                     │
│      - Price: $999                         │
│      - Rating: 4.8/5"                      │
│                                             │
│  3. Call OpenAI:                           │
│     System: "You are a shopping assistant" │
│     Context: [product details]             │
│     User: "What is this product?"          │
│                                             │
│  4. OpenAI responds (no tool call):        │
│     "This is the iPhone 15, priced at      │
│      $999 with a 4.8/5 rating..."          │
│                                             │
└──────┬──────────────────────────────────────┘
       │ { reply: "This is the iPhone 15...",
       │   action: undefined }
       ↓
┌─────────────┐
│    Main     │
│  Backend    │
└──────┬──────┘
       │ Returns response
       ↓
┌─────────────┐
│   Client    │
│  (Displays  │
│   message)  │
└─────────────┘
```

---

### Flow 2: Add to Cart (Tool Execution)

```
User: "Add to cart"

┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /chatbot/chat
       │ { message: "add to cart",
       │   product_id: "abc-123",
       │   user_id: "user-456" }
       │ Headers: { Authorization: "Bearer token..." }
       ↓
┌─────────────┐
│    Main     │
│  Backend    │
└──────┬──────┘
       │ Forwards with auth header
       ↓
┌─────────────────────────────────────────────┐
│          AI Chatbot Server                  │
│                                             │
│  1. Fetch product context                  │
│                                             │
│  2. Build AI prompt with tools              │
│                                             │
│  3. Call OpenAI API:                        │
│     User: "add to cart"                    │
│     Tools: [add_to_cart, search, similar]  │
│                                             │
│  4. OpenAI triggers tool:                  │
│     {                                       │
│       name: "add_to_cart",                 │
│       arguments: {                         │
│         product_id: "abc-123",             │
│         quantity: 1                        │
│       }                                     │
│     }                                       │
│                                             │
│  5. Execute tool:                          │
│     ┌─────────────────────────────┐        │
│     │  handleAddToCart()          │        │
│     │                             │        │
│     │  → Check if user logged in  │        │
│     │  → Yes, call CartService    │        │
│     │                             │        │
│     │  CartService.addToCart():   │        │
│     │    POST /cart/user-456      │   ─────┼───→ Main Backend
│     │    Headers: { Authorization }│       │    POST /cart/user-456
│     │    Body: {                  │        │    → Validates JWT
│     │      product_id: "abc-123", │        │    → Adds to database
│     │      quantity: 1             │        │    → Returns success
│     │    }                         │        │
│     │                             │   ←─────┼─── 200 OK
│     │  → Returns success payload  │        │
│     └─────────────────────────────┘        │
│                                             │
│  6. Format response:                        │
│     {                                       │
│       reply: "Great! I've added 1 item...",│
│       action: {                            │
│         type: "add_to_cart",               │
│         payload: {                         │
│           product_id: "abc-123",           │
│           quantity: 1,                     │
│           success: true                    │
│         }                                   │
│       }                                     │
│     }                                       │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────┐
│    Main     │
│  Backend    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│         Client              │
│                             │
│  1. Display AI message:     │
│     "Great! I've added..."  │
│                             │
│  2. Handle action:          │
│     if (success) {          │
│       // Cart already       │
│       // updated on backend │
│       console.log("Success")│
│     }                       │
└─────────────────────────────┘
```

---

### Flow 3: Search Products (Tool Execution)

```
User: "Find laptops under $1000"

┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    Main     │
│  Backend    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│          AI Chatbot Server                  │
│                                             │
│  1. Call OpenAI with message                │
│                                             │
│  2. OpenAI triggers tool:                  │
│     {                                       │
│       name: "search_products",             │
│       arguments: {                         │
│         title: "laptop",                   │
│         maxPrice: 1000                     │
│       }                                     │
│     }                                       │
│                                             │
│  3. Execute tool:                          │
│     ┌──────────────────────────┐           │
│     │ handleSearchProducts()   │           │
│     │                          │           │
│     │ ProductService.search(): │           │
│     │   GET /product?          │      ─────┼───→ Main Backend
│     │     title=laptop&        │           │    GET /product?...
│     │     maxPrice=1000&       │           │    → Query database
│     │     sortBy=rating        │           │    → Return products
│     │                          │      ←─────┼─── [products array]
│     │                          │           │
│     │ → Returns product list   │           │
│     └──────────────────────────┘           │
│                                             │
│  4. Format response:                        │
│     {                                       │
│       reply: "I found 15 products:\n       │
│               1. Dell XPS - $899\n         │
│               2. HP Pavilion - $799\n      │
│               ...",                        │
│       action: {                            │
│         type: "search",                    │
│         payload: [product1, product2, ...] │
│       }                                     │
│     }                                       │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│         Client              │
│                             │
│  Display search results     │
│  (optional: show product    │
│   cards with action payload)│
└─────────────────────────────┘
```

---

## Authentication Flow

### Logged-In User Flow

```
1. User logs in → Receives JWT token
2. Token stored in auth context
3. Chatbot uses useAuthAPI hook
4. Request includes: Authorization: Bearer <token>

┌─────────────┐
│   Client    │ Has JWT token in auth context
└──────┬──────┘
       │ Authorization: Bearer eyJhbGc...
       ↓
┌─────────────┐
│    Main     │ Validates JWT (optional)
│  Backend    │ Forwards header to AI server
└──────┬──────┘
       │ Authorization: Bearer eyJhbGc...
       ↓
┌─────────────┐
│ AI Chatbot  │ Stores auth header
│   Server    │ Uses for backend API calls
└──────┬──────┘
       │ When calling cart API:
       │ Authorization: Bearer eyJhbGc...
       ↓
┌─────────────┐
│    Main     │ Authorization middleware
│  Backend    │ validates JWT → Allows access
│  (Cart API) │ Updates user's cart in DB
└─────────────┘
```

### Guest User Flow

```
1. No JWT token available
2. AI identifies guest user
3. Returns action with isGuest: true
4. Frontend handles local cart update

┌─────────────┐
│   Client    │ No JWT token
└──────┬──────┘
       │ No Authorization header
       ↓
┌─────────────┐
│    Main     │
│  Backend    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│      AI Chatbot Server      │
│                             │
│  Detects: user_id = null    │
│                             │
│  Returns:                   │
│  {                          │
│    action: {                │
│      type: "add_to_cart",   │
│      payload: {             │
│        product_id: "...",   │
│        quantity: 1,         │
│        isGuest: true  ←─────┼─── Special flag
│      }                      │
│    }                        │
│  }                          │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│         Client              │
│                             │
│  if (payload.isGuest) {     │
│    // Update localStorage   │
│    onAddToCart(id, qty);    │
│  }                          │
└─────────────────────────────┘
```

---

## Tool Execution Flow

### How OpenAI Function Calling Works

```
┌────────────────────────────────────────────────────────────┐
│                    OpenAI API Call                          │
│                                                             │
│  Input:                                                     │
│  {                                                          │
│    model: "gpt-4o-mini",                                   │
│    messages: [                                             │
│      { role: "system", content: "You are assistant..." },  │
│      { role: "user", content: "add to cart" }              │
│    ],                                                       │
│    tools: [                                                 │
│      {                                                      │
│        type: "function",                                   │
│        function: {                                         │
│          name: "add_to_cart",                              │
│          description: "Add product to cart...",            │
│          parameters: { ... }                               │
│        }                                                    │
│      },                                                     │
│      // ... other tools                                    │
│    ]                                                        │
│  }                                                          │
│                                                             │
│  OpenAI Decision:                                          │
│  ┌──────────────────────────────────────────────┐         │
│  │ Analyzes: "add to cart"                      │         │
│  │ Matches intent with tool description         │         │
│  │ Decision: Call add_to_cart function          │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  Output:                                                    │
│  {                                                          │
│    choices: [{                                             │
│      message: {                                            │
│        tool_calls: [{                                      │
│          function: {                                       │
│            name: "add_to_cart",                            │
│            arguments: '{"product_id":"...","quantity":1}'  │
│          }                                                  │
│        }]                                                   │
│      }                                                      │
│    }]                                                       │
│  }                                                          │
└────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌────────────────────────────────────────────────────────────┐
│              Our Chatbot Service Handles                    │
│                                                             │
│  1. Parse tool_calls from OpenAI response                  │
│  2. Extract function name and arguments                     │
│  3. Route to appropriate handler:                          │
│                                                             │
│     switch (functionName) {                                │
│       case "add_to_cart":                                  │
│         return handleAddToCart(args, context);             │
│       case "search_products":                              │
│         return handleSearchProducts(args);                 │
│       case "get_similar_products":                         │
│         return handleSimilarProducts(args);                │
│     }                                                       │
│                                                             │
│  4. Execute tool logic (API calls, data processing)        │
│  5. Return formatted response to client                     │
└────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Client → Main Backend

#### `POST /chatbot/chat`

**Request:**

```json
{
  "message": "add to cart",
  "product_id": "abc-123",
  "user_id": "user-456",
  "conversation_history": [
    { "role": "user", "content": "What is this?" },
    { "role": "assistant", "content": "This is iPhone 15..." }
  ]
}
```

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response:**

```json
{
  "reply": "Great! I've added 1 item to your cart.",
  "action": {
    "type": "add_to_cart",
    "payload": {
      "product_id": "abc-123",
      "quantity": 1,
      "success": true
    }
  }
}
```

---

### Main Backend → AI Chatbot Server

#### `POST /chat`

**Request:**

```json
{
  "message": "add to cart",
  "product_id": "abc-123",
  "user_id": "user-456",
  "conversation_history": [...]
}
```

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: sessionid=...
```

**Response:**

```json
{
  "reply": "Great! I've added 1 item to your cart.",
  "action": {
    "type": "add_to_cart",
    "payload": {
      "product_id": "abc-123",
      "quantity": 1,
      "success": true
    }
  }
}
```

---

### AI Chatbot Server → Main Backend APIs

#### `GET /product/:id`

Fetch product details

#### `GET /product?title=...&category=...`

Search products

#### `POST /cart/:user_id`

Add to cart

```json
{
  "product_id": "abc-123",
  "quantity": 1
}
```

---

## Data Flow Examples

### Example 1: Product Inquiry

**User Input:** "What are the features of this product?"

**AI Chatbot Server Process:**

1. Fetch product: `GET /product/abc-123`
2. Build context with product details
3. Call OpenAI with context
4. OpenAI responds (no tool call needed)
5. Return formatted response

**Response:**

```json
{
  "reply": "This iPhone 15 features:\n- A16 Bionic chip\n- 6.1-inch display\n- Dual camera system\n- All-day battery life\nPriced at $999 with a 4.8/5 rating."
}
```

---

### Example 2: Add Multiple Items

**User Input:** "Add 3 of these to my cart"

**OpenAI Tool Call:**

```json
{
  "name": "add_to_cart",
  "arguments": {
    "product_id": "abc-123",
    "quantity": 3
  }
}
```

**CartService Execution:**

```typescript
POST /cart/user-456
{
  "product_id": "abc-123",
  "quantity": 3
}
```

**Response:**

```json
{
  "reply": "Great! I've added 3 items to your cart.",
  "action": {
    "type": "add_to_cart",
    "payload": {
      "product_id": "abc-123",
      "quantity": 3,
      "success": true
    }
  }
}
```

---

### Example 3: Product Search

**User Input:** "Show me wireless headphones under $100"

**OpenAI Tool Call:**

```json
{
  "name": "search_products",
  "arguments": {
    "title": "wireless headphones",
    "maxPrice": 100
  }
}
```

**ProductService Execution:**

```typescript
GET /product?title=wireless+headphones&maxPrice=100&sortBy=rating
```

**Response:**

```json
{
  "reply": "I found 12 wireless headphones under $100:\n\n1. Sony WH-CH520 - $59.99 (4.5/5)\n2. JBL Tune 510BT - $39.99 (4.3/5)\n3. Anker Soundcore - $49.99 (4.6/5)\n...",
  "action": {
    "type": "search",
    "payload": [
      {
        "product_id": "prod-1",
        "title": "Sony WH-CH520",
        "price": 59.99,
        "rating": 4.5
      }
      // ... more products
    ]
  }
}
```

---

## Error Handling

### 1. OpenAI API Error

```typescript
try {
  const completion = await openai.chat.completions.create({...});
} catch (error) {
  Logger.error("OpenAI API Error", error);
  throw new Error("Failed to process chat message. Please try again.");
}
```

**Client sees:** "Sorry, I encountered an error. Please try again."

---

### 2. Product Not Found

```typescript
try {
  const product = await ProductService.getProductDetails(product_id);
} catch (error) {
  Logger.error("Failed to fetch product", error);
  // Continue without product context
  productContext = "";
}
```

**AI response:** "I don't have information about this product at the moment."

---

### 3. Cart API Failure

```typescript
try {
  await axios.post(`/cart/${user_id}`, {...});
  return { success: true };
} catch (error) {
  Logger.error("Failed to add to cart", error);
  return {
    success: false,
    error: error.message
  };
}
```

**AI response:** "Sorry, there was an error adding the product to your cart. Please try again or add it manually."

---

### 4. Authentication Error

```typescript
if (!authHeader && user_id) {
  Logger.warn("Authenticated request missing Authorization header");
}
```

**Cart API returns:** `401 Unauthorized`

**Handled by CartService:** Returns `success: false` with error message

---

### 5. Invalid Tool Arguments

```typescript
if (!targetProductId) {
  Logger.warn("Add to cart called without product_id");
  return {
    reply: "Sorry, I need a product to add to cart.",
  };
}
```

---

## Technology Stack

### Frontend

- **React** - UI framework
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Main Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication

### AI Chatbot Server

- **Node.js** - Runtime
- **Express** - HTTP server
- **TypeScript** - Type safety
- **OpenAI SDK** - GPT-4 API integration
- **Axios** - HTTP client for backend calls

### External Services

- **OpenAI GPT-4o-mini** - Language model
- **PostgreSQL** - Database (via main backend)

---

## Key Design Decisions

### 1. **Why Separate AI Chatbot Server?**

**Reasons:**

- ✅ **Separation of concerns** - AI logic isolated from main business logic
- ✅ **Scalability** - Can scale AI server independently
- ✅ **Security** - OpenAI API key isolated in separate service
- ✅ **Maintainability** - Easy to update AI features without affecting main app
- ✅ **Testing** - Can test AI logic independently

---

### 2. **Why OpenAI Function Calling (Tools)?**

**Benefits:**

- ✅ **Structured actions** - AI can trigger specific operations
- ✅ **Reliable** - Better than parsing natural language
- ✅ **Type-safe** - Defined parameters and return types
- ✅ **Extensible** - Easy to add new tools

**Alternative Approach:**

- Parse AI response text for keywords like "add to cart"
- **Problems:** Unreliable, language-dependent, error-prone

---

### 3. **Why Pass Authorization Header Through Chain?**

**Flow:** Client → Main Backend → AI Server → Backend APIs

**Reason:**

- ✅ Cart API requires authentication
- ✅ AI server makes requests on behalf of user
- ✅ Maintains security (JWT validation at API level)
- ✅ Supports both logged-in and guest users

---

### 4. **Why Conversation History?**

**Purpose:**

- ✅ Context for multi-turn conversations
- ✅ AI remembers previous questions
- ✅ Better user experience

**Example:**

```
User: "What is this product?"
AI: "This is iPhone 15..."
User: "Add it to my cart"  ← AI knows "it" refers to iPhone 15
AI: "Great! I've added iPhone 15 to your cart."
```

---

## Performance Considerations

### 1. **Caching Product Details**

- Could cache frequently accessed products
- Reduce API calls to main backend

### 2. **OpenAI Response Time**

- Average: 1-3 seconds
- User sees loading indicator during wait

### 3. **Tool Execution**

- Some tools require additional API calls
- Total latency: 2-5 seconds for complex requests

### 4. **Rate Limiting**

- OpenAI has rate limits per API key
- Consider implementing request queue for high traffic

---

## Security Considerations

### 1. **JWT Token Validation**

- Main backend validates JWT before forwarding
- AI server forwards token to backend APIs
- Backend APIs validate again (defense in depth)

### 2. **API Key Protection**

- OpenAI API key stored in environment variable
- Only accessible to AI Chatbot Server
- Not exposed to client

### 3. **Input Validation**

- Request validation at main backend
- Prevents injection attacks
- Sanitizes user input

### 4. **CORS Configuration**

- Strict origin policy
- Only allows requests from known frontend

---

## Future Enhancements

### 1. **Additional Tools**

- `get_order_status` - Check order status
- `track_shipment` - Track package
- `apply_coupon` - Apply discount codes
- `get_recommendations` - Personalized recommendations

### 2. **Multi-language Support**

- Detect user language
- Respond in user's language
- Translate product details

### 3. **Voice Integration**

- Speech-to-text for voice input
- Text-to-speech for voice responses

### 4. **Analytics**

- Track common questions
- Identify product issues
- Measure conversion rates

### 5. **Proactive Assistance**

- Suggest products based on browsing history
- Offer help when user seems stuck
- Highlight deals and promotions

---

## Conclusion

This AI-powered chatbot system provides intelligent shopping assistance by:

- Understanding natural language queries
- Accessing real-time product information
- Performing actions (add to cart, search, etc.)
- Maintaining conversation context
- Handling both authenticated and guest users

The architecture is scalable, maintainable, and follows best practices for separation of concerns and security.

---

## Related Documentation

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/introduction)

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0
