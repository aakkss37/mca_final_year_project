import axios from 'axios';
import type { ChatRequest, ChatResponse } from './chatbot.types';
import { HttpStatusCode } from '@/shared/types/enums/httpcode.types';
import AppError from '@/shared/exceptions/app-error';
import type { Request } from 'express';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001';

export class ChatbotService {
	/**
	 * Process chat message by forwarding to MCP server with auth cookies
	 */
	public static async processChat(chatRequest: ChatRequest, req: Request): Promise<ChatResponse> {
		try {
			// Get cookies from the original request
			const authorization = req.headers.authorization || '';
			console.log('-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:');
			console.log('Main Server forwarding request to MCP: ', {
				message: chatRequest.message,
				product_id: chatRequest.product_id,
				user_id: chatRequest.user_id,
				authorization: authorization,
			});
			console.log('-----=-=-=-=-=-=-=-=--=-=->>>>>>>>>>>>:');

			// Forward request to MCP server with cookies
			const response = await axios.post(`${MCP_SERVER_URL}/chat`, chatRequest, {
				timeout: 30000, // 30 second timeout
				headers: {
					authorization: authorization, // Forward authentication token
				},
			});

			console.log('Main Server received MCP response:', response.data);

			return response.data;
		} catch (error: any) {
			console.error('MCP Server Communication Error:', error.message);

			// Provide helpful error message
			if (error.code === 'ECONNREFUSED') {
				throw new AppError(
					'AI service is currently unavailable. Please ensure MCP server is running on port 3001.',
					HttpStatusCode.SERVICE_UNAVAILABLE,
					'processChat'
				);
			}

			throw new AppError(
				'Failed to process chat message. Please try again.',
				HttpStatusCode.INTERNAL_SERVER_ERROR,
				'processChat'
			);
		}
	}
}
