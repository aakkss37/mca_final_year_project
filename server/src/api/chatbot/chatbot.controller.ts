import { Request, Response, NextFunction } from 'express';
import { ChatbotService } from './chatbot.service';
import { HttpStatusCode } from '@/shared/types/enums/httpcode.types';
import type { ChatRequest } from './chatbot.types';

export class ChatbotController {
	public static async chat(req: Request, res: Response, next: NextFunction) {
		const chatRequest: ChatRequest = {
			message: req.body.message,
			product_id: req.body.product_id,
			user_id: req.body.user_id,
			conversation_history: req.body.conversation_history || [],
		};

		// Pass the request object to access cookies
		const response = await ChatbotService.processChat(chatRequest, req);

		res.status(HttpStatusCode.OK).json(response);
	}
}
