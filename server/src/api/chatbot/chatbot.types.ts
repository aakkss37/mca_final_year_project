export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface ChatRequest {
	message: string;
	product_id?: string;
	user_id?: string;
	conversation_history?: ChatMessage[];
}

export interface ChatResponse {
	reply: string;
	action?: {
		type: 'add_to_cart' | 'navigate' | 'search';
		payload?: any;
	};
}
