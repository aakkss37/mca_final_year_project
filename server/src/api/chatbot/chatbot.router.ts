import { Router } from 'express';
import tryCatchMiddleware from '@/middlewares/tryCatch.middleware';
import { ChatbotController } from './chatbot.controller';
import { checkSchema } from 'express-validator';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { chatbotSchema } from './chatbot.validator';

const router = Router();

// Chatbot endpoint for AI conversations
router.post('/chat', checkSchema(chatbotSchema), validationMiddleware, tryCatchMiddleware(ChatbotController.chat));

export default router;
