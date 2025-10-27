# AI Chatbot Integration Guide

This guide will help you integrate the AI chatbot with MCP server into your e-commerce application.

## Overview

The chatbot system consists of three main components:

1. **Frontend Chatbot Component** - React component for user interaction
2. **Backend Chatbot API** - Express.js endpoint that processes chat requests
3. **MCP Server** (Optional) - Advanced tool-based AI assistant

## Architecture

```
┌─────────────────┐
│  Frontend UI    │
│  (Chatbot.tsx)  │
└────────┬────────┘
         │ HTTP POST /chatbot/chat
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   OpenAI API    │
│   (GPT-4)       │
└─────────────────┘
```

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```bash
cd server
npm install openai
```

#### Add OpenAI API Key

Add to your `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key
```

#### Files Created

- ✅ `server/src/api/chatbot/chatbot.router.ts`
- ✅ `server/src/api/chatbot/chatbot.controller.ts`
- ✅ `server/src/api/chatbot/chatbot.service.ts`
- ✅ `server/src/api/chatbot/chatbot.validator.ts`
- ✅ `server/src/api/chatbot/chatbot.types.ts`

#### Router Added to App

The chatbot router has been added to `app.ts`:

```typescript
app.use("/chatbot", ChatbotRouter);
```

### 2. Frontend Setup

#### Add Chatbot Component

The `Chatbot.component.tsx` has been created at:

```
client/src/shared/components/Chatbot.component.tsx
```

#### Usage in Product Page

Open your Product page component and add the chatbot:

```typescript
import { Chatbot } from "@/shared/components/Chatbot.component";

export function ProductPage() {
  const { id } = useParams();

  // Your existing cart logic
  const handleAddToCart = (productId: string, quantity: number) => {
    // Add to cart logic here
    console.log("Adding to cart:", productId, quantity);
  };

  return (
    <div>
      {/* Your existing product page content */}

      {/* Add Chatbot */}
      <Chatbot productId={id} onAddToCart={handleAddToCart} />
    </div>
  );
}
```

### 3. Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and paste it into your `.env` file

**Important**: Never commit your API key to version control!

### 4. Testing

#### Test the Backend Endpoint

Start your server:

```bash
cd server
npm run start:dev
```

Test with curl:

```bash
curl -X POST http://localhost:3000/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about this product",
    "product_id": "your-product-uuid-here"
  }'
```

#### Test the Frontend

1. Start your frontend:

```bash
cd client
npm run dev
```

2. Navigate to a product page
3. Click the blue chat button in the bottom-right corner
4. Start chatting!

## Features

### What Users Can Do

1. **Ask about products**

   - "What's the warranty on this?"
   - "Is this available in other colors?"
   - "Tell me more about the specifications"

2. **Add to cart via chat**

   - "Add this to my cart"
   - "I want to buy this"
   - "Purchase this product"

3. **Find similar products**
   - "Show me similar products"
   - "What else is like this?"
   - "Find alternatives"

### AI Features

- **Context-aware**: Knows which product the user is viewing
- **Intent detection**: Automatically detects when user wants to add to cart
- **Conversational**: Natural, friendly responses
- **Memory**: Maintains conversation history during session

## API Endpoint

### POST /chatbot/chat

**Request Body:**

```json
{
  "message": "Tell me about this product",
  "product_id": "uuid-of-product",
  "user_id": "uuid-of-user",
  "conversation_history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Response:**

```json
{
  "reply": "This is a great product with...",
  "action": {
    "type": "add_to_cart",
    "payload": {
      "product_id": "uuid",
      "quantity": 1
    }
  }
}
```

## Customization

### Change AI Model

In `chatbot.service.ts`, change the model:

```typescript
model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo'
```

### Adjust AI Personality

Modify the system prompt in `chatbot.service.ts`:

```typescript
const systemPrompt = `You are a [personality here]...`;
```

### Style the Chatbot

Edit the Tailwind classes in `Chatbot.component.tsx`

## MCP Server (Advanced - Optional)

For advanced tool-based AI interactions, you can set up the MCP server:

```bash
cd mcp-server
npm install
npm run dev
```

See `mcp-server/README.md` for details.

## Cost Estimation

OpenAI API costs (approximate):

- GPT-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- GPT-4: ~$30 per 1M input tokens, ~$60 per 1M output tokens

Average conversation (10 messages): $0.01 - $0.05

## Troubleshooting

### "OpenAI API Error"

- Check your API key is valid
- Ensure you have credits in your OpenAI account
- Check your internet connection

### Chatbot doesn't appear

- Ensure component is imported correctly
- Check browser console for errors
- Verify Tailwind CSS is configured

### Product context not working

- Verify product_id is being passed correctly
- Check backend can fetch product from database
- Look at network tab for API errors

## Security Notes

1. **API Key**: Never expose your OpenAI API key to the frontend
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Input Validation**: The validator checks all inputs
4. **User Authentication**: For cart operations with user_id

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test the chatbot on a product page
3. ✅ Customize the AI personality
4. ⬜ Add rate limiting (recommended for production)
5. ⬜ Monitor API costs
6. ⬜ Collect user feedback

## Support

For issues or questions, check:

- OpenAI API documentation: https://platform.openai.com/docs
- Your backend logs: Look for errors in terminal
- Browser console: Check for frontend errors

Happy chatting! 🤖
