# AI Chatbot - Test Scenarios & Example Conversations

## 🧪 Testing Guide

This document provides test scenarios and example conversations to verify your chatbot is working correctly.

## 📋 Test Scenarios

### Scenario 1: Product Information Query

**Setup**: Open any product page

**Test Cases**:

#### Test 1.1: Basic Product Info

```
User: "Tell me about this product"

Expected AI Response:
Should include:
- Product name
- Price
- Key features
- Category/brand info
```

#### Test 1.2: Specific Details

```
User: "What's the warranty?"

Expected AI Response:
Should mention the warranty_info from product data
```

#### Test 1.3: Availability

```
User: "Is this in stock?"

Expected AI Response:
Should mention stock count from database
```

#### Test 1.4: Return Policy

```
User: "Can I return this if I don't like it?"

Expected AI Response:
Should mention return_policy from product data
```

---

### Scenario 2: Add to Cart Intent

**Setup**: Open a product page with valid product

**Test Cases**:

#### Test 2.1: Direct Request

```
User: "Add this to my cart"

Expected AI Response:
- Should say it's adding to cart
- Should trigger add-to-cart action
- Should show success message

Expected Action:
{
  type: "add_to_cart",
  payload: { product_id: "xxx", quantity: 1 }
}
```

#### Test 2.2: Casual Request

```
User: "I want to buy this"

Expected: Same as above
```

#### Test 2.3: Purchase Intent

```
User: "I'd like to purchase this product"

Expected: Same as above
```

#### Test 2.4: Informal Request

```
User: "Get me this"

Expected: Should detect intent and add to cart
```

---

### Scenario 3: Product Discovery

**Setup**: Open any product page

**Test Cases**:

#### Test 3.1: Similar Products

```
User: "Show me similar products"

Expected AI Response:
- Should mention finding similar items
- Should reference category/price range
```

#### Test 3.2: Alternatives

```
User: "What else do you have like this?"

Expected: Should suggest similar products
```

#### Test 3.3: Category Search

```
User: "Show me other laptops"

Expected: Should mention other products in category
```

---

### Scenario 4: Conversational Flow

**Setup**: Open product page, start conversation

**Test Case 4.1: Multi-Turn Conversation**

```
Turn 1:
User: "What's the price?"
AI: "This product is priced at $XXX"

Turn 2:
User: "Is that on sale?"
AI: Should reference the previous context

Turn 3:
User: "Okay, add it to my cart"
AI: Should add to cart
Action: add_to_cart triggered
```

**Test Case 4.2: Context Switching**

```
User: "Tell me about the warranty"
AI: [explains warranty]

User: "What about shipping?"
AI: Should switch to shipping info smoothly
```

---

### Scenario 5: Edge Cases

**Test Cases**:

#### Test 5.1: Empty Message

```
User: ""

Expected: Input should be disabled/prevented
```

#### Test 5.2: Very Long Message

```
User: [300+ character message]

Expected: Should handle gracefully
```

#### Test 5.3: Special Characters

```
User: "What's the price? <script>alert('test')</script>"

Expected: Should sanitize input, respond normally
```

#### Test 5.4: No Product Context

```
User: Opens chatbot on non-product page (if possible)

Expected: Should provide general help
```

---

## 💬 Example Conversations

### Example 1: Happy Path - Purchase Flow

```
👤 User: "Hi, what can you tell me about this laptop?"

🤖 AI: "This is the Gaming Laptop Pro - a high-performance laptop
featuring an Intel i7 processor, 16GB RAM, and RTX 3060 graphics
card. It's priced at $1,299.99 and currently has 30 units in stock.
This laptop is perfect for gaming and heavy workloads. Would you
like to know more about any specific features?"

👤 User: "What's the warranty?"

🤖 AI: "This Gaming Laptop Pro comes with a comprehensive 2-year
warranty that covers manufacturing defects and hardware issues.
Is there anything else you'd like to know?"

👤 User: "Sounds good! Add it to my cart"

🤖 AI: "Great choice! I'm adding the Gaming Laptop Pro to your
cart right now. You can proceed to checkout whenever you're ready!"

[Action: Product added to cart ✓]
```

---

### Example 2: Product Comparison

```
👤 User: "I'm looking at this smartphone. What makes it special?"

🤖 AI: "This 5G Smartphone Ultra features a stunning 6.7-inch OLED
display, 128GB storage, and an impressive 48MP camera system. It's
priced at $899.99 and has excellent ratings at 4.8/5. Key features
include 5G connectivity, all-day battery life, and fast charging."

👤 User: "Do you have anything similar but cheaper?"

🤖 AI: "I can help you find similar smartphones in a lower price
range. Let me search for alternatives in the smartphones category
with comparable features. Would you like me to show you options
under $700?"

👤 User: "Yes please"

🤖 AI: "Here are some similar smartphones under $700:
1. Premium Phone A - $649.99 (Rating: 4.6/5)
2. Budget Flagship B - $599.99 (Rating: 4.5/5)
3. Value Smartphone C - $549.99 (Rating: 4.4/5)

Would you like details about any of these?"
```

---

### Example 3: Detailed Product Inquiry

```
👤 User: "What's the return policy for this product?"

🤖 AI: "This product has a 30-day return policy. You can return
it within 30 days of purchase if you're not completely satisfied.
The item must be in its original condition with all accessories
and packaging."

👤 User: "What about shipping?"

🤖 AI: "This product qualifies for free shipping on orders over $50.
Standard delivery typically takes 3-5 business days. Expedited
shipping options are also available at checkout."

👤 User: "Is it available in other colors?"

🤖 AI: "Based on the current product information, this is available
in the color shown. If you're looking for different color options,
I can help you search for similar products that might have more
color choices. Would you like me to do that?"
```

---

### Example 4: Stock and Availability

```
👤 User: "Is this in stock?"

🤖 AI: "Yes! This product currently has 85 units in stock and is
ready to ship. It's a popular item, so I'd recommend adding it to
your cart soon if you're interested!"

👤 User: "Great! How fast can I get it?"

🤖 AI: "With standard shipping, you can expect delivery in 3-5
business days. If you need it sooner, expedited shipping options
are available at checkout for 1-2 day delivery. Would you like me
to add this to your cart?"

👤 User: "Yes, add it please"

🤖 AI: "Perfect! I've added this to your cart. You can continue
shopping or proceed to checkout to complete your purchase!"

[Action: Product added to cart ✓]
```

---

### Example 5: Technical Specifications

```
👤 User: "What are the dimensions of this product?"

🤖 AI: "This product measures 35cm wide × 25cm high × 2cm deep
and weighs 2.5kg. It's designed to be portable while still
offering excellent performance."

👤 User: "Will it fit in a standard laptop bag?"

🤖 AI: "Yes! With dimensions of 35cm × 25cm × 2cm, it should fit
comfortably in most standard laptop bags designed for 15-inch
laptops. The slim 2cm profile makes it very portable."

👤 User: "Perfect, I'll take it"

🤖 AI: "Excellent choice! I'm adding it to your cart now. Is there
anything else you'd like to know about this product or would you
like to see any accessories that go well with it?"

[Action: Product added to cart ✓]
```

---

## 🔍 Testing Checklist

### Basic Functionality Tests

- [ ] Chatbot button appears
- [ ] Chat window opens/closes correctly
- [ ] Messages send successfully
- [ ] AI responses appear
- [ ] Loading states show during API calls
- [ ] Error messages display when needed

### Product Context Tests

- [ ] AI knows current product name
- [ ] AI provides accurate price
- [ ] AI mentions correct stock levels
- [ ] AI references warranty correctly
- [ ] AI describes category/brand correctly

### Intent Detection Tests

- [ ] "Add to cart" triggers action
- [ ] "Buy this" triggers action
- [ ] "I want this" triggers action
- [ ] "Purchase" triggers action
- [ ] Success message shows after add

### Conversation Flow Tests

- [ ] Can have multi-turn conversations
- [ ] AI maintains context
- [ ] History is preserved during session
- [ ] Can switch topics naturally

### Edge Case Tests

- [ ] Empty messages blocked
- [ ] Long messages handled
- [ ] Special characters sanitized
- [ ] Network errors handled gracefully
- [ ] Invalid product IDs handled

### Mobile Tests

- [ ] Works on mobile browsers
- [ ] Keyboard doesn't break UI
- [ ] Touch interactions work
- [ ] Responsive design looks good

---

## 🎯 Success Criteria

A successful chatbot implementation should:

✅ Respond within 3-5 seconds
✅ Provide accurate product information
✅ Detect add-to-cart intent reliably
✅ Handle errors gracefully
✅ Work on all major browsers
✅ Work on mobile devices
✅ Maintain conversation context
✅ Have friendly, helpful tone

---

## 📊 Metrics to Track During Testing

1. **Response Time**: Should be < 5 seconds
2. **Accuracy**: Product info should match database
3. **Intent Detection**: Should catch add-to-cart > 90% of time
4. **Error Rate**: Should be < 5%
5. **User Experience**: Should feel natural and helpful

---

## 🐛 Common Issues & Solutions

### Issue: AI doesn't know product details

**Solution**: Verify product_id is being passed correctly

### Issue: Add to cart not working

**Solution**: Check onAddToCart callback is defined

### Issue: Slow responses

**Solution**: Check OpenAI API status, consider using GPT-4o-mini

### Issue: Context lost between messages

**Solution**: Verify conversation_history is being sent

---

## 📝 Testing Notes Template

Use this to document your testing:

```
Date: ___________
Tester: ___________
Product Tested: ___________

Test Scenario: ___________
Input: ___________
Expected: ___________
Actual: ___________
Pass/Fail: ___________
Notes: ___________
```

---

Happy testing! 🧪✨
