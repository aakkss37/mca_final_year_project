import { Schema } from 'express-validator';

export const chatbotSchema: Schema = {
	message: {
		in: ['body'],
		notEmpty: {
			errorMessage: 'Message is required!',
		},
		isString: {
			errorMessage: 'Message must be a string!',
		},
		trim: true,
	},
	product_id: {
		in: ['body'],
		optional: true,
		isUUID: {
			errorMessage: 'Product ID must be a valid UUID!',
		},
	},
	user_id: {
		in: ['body'],
		optional: true,
		isUUID: {
			errorMessage: 'User ID must be a valid UUID!',
		},
	},
	conversation_history: {
		in: ['body'],
		optional: true,
		isArray: {
			errorMessage: 'Conversation history must be an array!',
		},
	},
};
