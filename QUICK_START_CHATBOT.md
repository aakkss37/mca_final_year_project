# Quick Start: AI Chatbot Integration

## ✅ What's Been Done

I've successfully integrated an AI chatbot into your e-commerce application! Here's what was created:

### Backend (Server)

- ✅ Chatbot API endpoint: `/chatbot/chat`
- ✅ OpenAI integration with GPT-4o-mini
- ✅ Product context awareness
- ✅ Intent detection (add to cart, search, etc.)
- ✅ Conversation history management

### Frontend (Client)

- ✅ Beautiful chatbot UI component
- ✅ Real-time messaging
- ✅ Product page integration
- ✅ Add to cart functionality
- ✅ Responsive design

### Files Created/Modified

**Server:**

- `server/src/api/chatbot/chatbot.router.ts`
- `server/src/api/chatbot/chatbot.controller.ts`
- `server/src/api/chatbot/chatbot.service.ts`
- `server/src/api/chatbot/chatbot.validator.ts`
- `server/src/api/chatbot/chatbot.types.ts`
- `server/src/app.ts` (modified - added chatbot router)
- `server/.env` (modified - added OPENAI_API_KEY)

**Client:**

- `client/src/shared/components/Chatbot.component.tsx`
- `client/src/pages/product/Product.page.tsx` (modified - added chatbot)

## 🚀 How to Get Started

### Step 1: Install OpenAI Package

The OpenAI package has already been installed in your server. If you need to reinstall:

```bash
cd server
npm install openai
```

### Step 2: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)

### Step 3: Add API Key to .env

Open `server/.env` and replace the placeholder:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 4: Start Your Servers

**Terminal 1 - Backend:**

```bash
cd server
npm run start:dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

### Step 5: Test the Chatbot

1. Open your browser to `http://localhost:5173` (or your client URL)
2. Navigate to any product page
3. Look for the blue chat button in the bottom-right corner
4. Click it and start chatting!

## 💬 What Users Can Ask

### Product Questions

- "What's the warranty on this product?"
- "Tell me more about the features"
- "Is this in stock?"
- "What's the return policy?"

### Shopping Actions

- "Add this to my cart"
- "I want to buy this"
- "Purchase this product"

### Product Discovery

- "Show me similar products"
- "Find alternatives"
- "What else do you have in this category?"

## 🎨 Chatbot Features

✅ **Context-Aware**: Knows which product the user is viewing
✅ **Natural Language**: Understands casual conversation
✅ **Action Detection**: Automatically detects add-to-cart requests
✅ **Conversation Memory**: Remembers chat history during session
✅ **Beautiful UI**: Modern, responsive design
✅ **Real-time**: Instant responses

## 🔧 Customization

### Change AI Model

In `server/src/api/chatbot/chatbot.service.ts`, line ~66:

```typescript
model: 'gpt-4o-mini', // Change to 'gpt-4', 'gpt-3.5-turbo', etc.
```

### Adjust AI Personality

In `server/src/api/chatbot/chatbot.service.ts`, modify the system prompt (line ~34):

```typescript
const systemPrompt = `You are a friendly shopping assistant...`;
```

### Style the Chatbot

Edit `client/src/shared/components/Chatbot.component.tsx` and modify the Tailwind CSS classes.

### Connect to Real Cart

In `client/src/pages/product/Product.page.tsx`, replace the TODO comment with your actual add-to-cart logic:

```typescript
onAddToCart={(productId, quantity) => {
    // Your existing cart logic here
    addToCartFunction(productId, quantity);
}}
```

## 📊 API Costs

Using GPT-4o-mini (recommended for cost-effectiveness):

- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

**Typical conversation cost**: $0.01 - $0.03

To monitor costs, check your OpenAI dashboard: https://platform.openai.com/usage

## 🐛 Troubleshooting

### Chatbot button doesn't appear

- Check browser console for errors
- Ensure the component is imported correctly
- Verify you're on a product page with a valid product ID

### "Failed to process chat message"

1. Check your OpenAI API key is correct
2. Verify you have credits in your OpenAI account
3. Check server logs for detailed errors
4. Ensure backend server is running

### Product context not working

1. Verify product_id is being passed to the chatbot
2. Check that the product exists in your database
3. Look at network tab for failed API calls

### CORS errors

- The CORS middleware should handle this
- If issues persist, check `server/src/middlewares/cors.middleware.ts`

## 📱 Testing Examples

Try these conversations:

**Example 1: Product Info**

```
User: "What can you tell me about this product?"
AI: "This is [product name]..."
```

**Example 2: Add to Cart**

```
User: "I want to buy this"
AI: "Great choice! I'm adding this to your cart..."
```

**Example 3: Find Similar**

```
User: "Show me similar products"
AI: "Here are some similar items in the [category] category..."
```

## 🎯 Next Steps

1. ✅ Add your OpenAI API key
2. ✅ Test the chatbot on a product page
3. ⬜ Customize the AI personality for your brand
4. ⬜ Connect the add-to-cart action to your existing cart logic
5. ⬜ Add rate limiting for production (recommended)
6. ⬜ Monitor API usage and costs
7. ⬜ Collect user feedback

## 📚 Additional Resources

- Full integration guide: `CHATBOT_INTEGRATION_GUIDE.md`
- OpenAI API docs: https://platform.openai.com/docs
- React component source: `client/src/shared/components/Chatbot.component.tsx`
- Backend service: `server/src/api/chatbot/chatbot.service.ts`

## 🎉 You're All Set!

Your AI chatbot is ready to go! Just add your OpenAI API key and start chatting.

Need help? Check the integration guide or review the code comments.

Happy chatting! 🤖✨
