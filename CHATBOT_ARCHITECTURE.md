# AI Chatbot Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Product Page Component                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         Chatbot.component.tsx                   │  │  │
│  │  │  • Chat UI                                      │  │  │
│  │  │  • Message history                              │  │  │
│  │  │  • User input                                   │  │  │
│  │  │  • Product context (product_id)                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP POST /chatbot/chat
                           │ { message, product_id, user_id, history }
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Express.js Server (app.ts)                         │  │
│  │                                                       │  │
│  │   ┌──────────────────────────────────────────────┐  │  │
│  │   │  Chatbot Router (/chatbot)                   │  │  │
│  │   │  • Route: POST /chat                         │  │  │
│  │   │  • Validation middleware                     │  │  │
│  │   └──────────────────────────────────────────────┘  │  │
│  │                     ▼                                 │  │
│  │   ┌──────────────────────────────────────────────┐  │  │
│  │   │  Chatbot Controller                          │  │  │
│  │   │  • Extract request data                      │  │  │
│  │   │  • Call service layer                        │  │  │
│  │   │  • Return response                           │  │  │
│  │   └──────────────────────────────────────────────┘  │  │
│  │                     ▼                                 │  │
│  │   ┌──────────────────────────────────────────────┐  │  │
│  │   │  Chatbot Service                             │  │  │
│  │   │  • Fetch product from DB (if product_id)    │  │  │
│  │   │  • Build context & prompts                   │  │  │
│  │   │  • Call OpenAI API                           │  │  │
│  │   │  • Detect user intent                        │  │  │
│  │   │  • Return reply + action                     │  │  │
│  │   └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ API Call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      OPENAI API                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   GPT-4o-mini Model                                   │  │
│  │   • Receives system prompt + product context         │  │
│  │   • Receives conversation history                    │  │
│  │   • Receives user message                            │  │
│  │   • Generates intelligent response                   │  │
│  │   • Returns AI-generated reply                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ AI Response
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (continued)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Intent Detection                                    │  │
│  │   • Analyze user message                             │  │
│  │   • Analyze AI response                              │  │
│  │   • Detect: add_to_cart, search, etc.               │  │
│  │   • Create action payload if needed                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Response: { reply, action }
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (continued)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Response Handler                                    │  │
│  │   • Display AI reply in chat                         │  │
│  │   • Check for action                                 │  │
│  │   • If action.type === 'add_to_cart':               │  │
│  │     → Call onAddToCart(product_id, quantity)        │  │
│  │     → Update cart state                              │  │
│  │     → Show confirmation message                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Flow Diagram

### Flow 1: User Asks About Product

```
User: "What's the warranty?"
       ↓
┌──────────────────────┐
│  Frontend Component  │
│  • Add message to UI │
│  • Show loading      │
└──────────────────────┘
       ↓
POST /chatbot/chat {
  message: "What's the warranty?",
  product_id: "abc-123",
  conversation_history: [...]
}
       ↓
┌──────────────────────┐
│   Backend Service    │
│  • Get product data  │
│  • Build context     │
└──────────────────────┘
       ↓
Product Context:
"Current Product:
 - Name: Gaming Laptop
 - Price: $1299.99
 - Warranty: 2 years"
       ↓
┌──────────────────────┐
│     OpenAI API       │
│  • System prompt     │
│  • Product context   │
│  • User question     │
└──────────────────────┘
       ↓
AI Reply:
"This Gaming Laptop comes
with a 2-year warranty..."
       ↓
┌──────────────────────┐
│   Intent Detection   │
│  • No action needed  │
└──────────────────────┘
       ↓
Response: {
  reply: "This Gaming Laptop...",
  action: undefined
}
       ↓
┌──────────────────────┐
│  Frontend Display    │
│  • Show AI message   │
│  • No action taken   │
└──────────────────────┘
```

### Flow 2: User Wants to Buy

```
User: "I want to buy this"
       ↓
┌──────────────────────┐
│  Frontend Component  │
│  • Add message to UI │
│  • Show loading      │
└──────────────────────┘
       ↓
POST /chatbot/chat {
  message: "I want to buy this",
  product_id: "abc-123",
  user_id: "user-456"
}
       ↓
┌──────────────────────┐
│   Backend Service    │
│  • Get product data  │
│  • Build context     │
└──────────────────────┘
       ↓
┌──────────────────────┐
│     OpenAI API       │
│  • Generate response │
└──────────────────────┘
       ↓
AI Reply:
"Great choice! I'm adding
this to your cart now."
       ↓
┌──────────────────────┐
│   Intent Detection   │
│  ✓ "buy" detected    │
│  ✓ Product ID exists │
│  → add_to_cart       │
└──────────────────────┘
       ↓
Response: {
  reply: "Great choice!...",
  action: {
    type: "add_to_cart",
    payload: {
      product_id: "abc-123",
      quantity: 1
    }
  }
}
       ↓
┌──────────────────────┐
│  Frontend Handler    │
│  • Show AI message   │
│  • Detect action     │
│  • Call onAddToCart()│
└──────────────────────┘
       ↓
┌──────────────────────┐
│   Cart Updated ✓     │
│  • Item added        │
│  • Show success msg  │
└──────────────────────┘
```

## Data Flow

### Request Flow

```
User Input
    → Frontend validates input
    → Axios POST request
    → Backend receives request
    → Express validator checks input
    → Controller extracts data
    → Service processes request
        → Fetch product from DB (optional)
        → Build AI prompt with context
        → Call OpenAI API
        → Parse AI response
        → Detect intent
        → Build response object
    → Controller returns response
    → Frontend receives response
    → Display in UI
    → Execute action (if any)
```

## Component Communication

```
┌─────────────────┐
│  Product Page   │
│                 │
│  productId ────┼──┐
│                 │  │
└─────────────────┘  │
                     │ Props
                     ▼
              ┌─────────────────┐
              │  Chatbot.tsx    │
              │                 │
              │  • productId    │◄──── Context
              │  • onAddToCart  │
              │  • messages[]   │◄──── State
              │  • input        │
              └─────────────────┘
                     │
                     │ Axios
                     ▼
              ┌─────────────────┐
              │  Backend API    │
              │                 │
              │  /chatbot/chat  │
              └─────────────────┘
                     │
                     │ HTTP
                     ▼
              ┌─────────────────┐
              │  OpenAI API     │
              │                 │
              │  GPT-4o-mini    │
              └─────────────────┘
```

## State Management

```
Frontend State:
┌─────────────────────┐
│  Chatbot Component  │
├─────────────────────┤
│ • isOpen: boolean   │
│ • messages: []      │
│ • input: string     │
│ • isLoading: bool   │
│ • productId: string │
└─────────────────────┘

Backend State:
┌─────────────────────┐
│  Stateless          │
├─────────────────────┤
│ Each request is     │
│ independent.        │
│ Conversation        │
│ history is sent     │
│ from frontend.      │
└─────────────────────┘
```

## Error Handling Flow

```
Error Occurs
    ↓
┌────────────────────────┐
│ Where did it happen?   │
└────────────────────────┘
    ↓           ↓
Frontend    Backend
    ↓           ↓
Catch       Try-Catch
    ↓           ↓
Display     Log Error
Error           ↓
Message     Send Error
    ↓       Response
    ↓           ↓
User sees   Frontend
friendly    receives
message     error
            ↓
        Display
        to user
```

## Security Flow

```
Request from Frontend
    ↓
┌────────────────────────┐
│  CORS Middleware       │
│  ✓ Check origin        │
└────────────────────────┘
    ↓
┌────────────────────────┐
│  Validation Middleware │
│  ✓ Check input format  │
│  ✓ Sanitize input      │
└────────────────────────┘
    ↓
┌────────────────────────┐
│  Controller            │
│  ✓ Process request     │
└────────────────────────┘
    ↓
┌────────────────────────┐
│  Service               │
│  ✓ Use server-side key │
│  ✓ Never expose key    │
└────────────────────────┘
    ↓
Response to Frontend
```

## Performance Optimization

```
Frontend:
- Debounce typing (optional)
- Local message state
- Optimistic UI updates
- Lazy load component

Backend:
- Cache product data (optional)
- Stream responses (future)
- Rate limiting
- Response compression

OpenAI:
- Use faster model (4o-mini)
- Limit token count
- Set max_tokens
- Optimize prompts
```

---

This architecture ensures:

- ✅ Clean separation of concerns
- ✅ Scalable and maintainable
- ✅ Secure API key handling
- ✅ Fast response times
- ✅ Good user experience
