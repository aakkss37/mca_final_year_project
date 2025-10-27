/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/shared/hooks/useAuth.hook';
import { usePrivateAPI } from '../hooks';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatbotProps {
    productId?: string;
    onAddToCart?: (productId: string, quantity: number) => void;
}

export function Chatbot({ productId, onAddToCart }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: productId
                ? 'Hi! I can help you learn more about this product. Feel free to ask me anything!'
                : 'Hi! How can I help you today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const PRIVATE_API = usePrivateAPI();
    const { auth } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await PRIVATE_API.post('/chatbot/chat', {
                message: input,
                product_id: productId,
                user_id: auth?.user?.user_id,
                conversation_history: messages,
            });

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.data.reply,
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Handle actions from MCP server
            if (response.data.action) {
                const { type, payload } = response.data.action;

                if (type === 'add_to_cart') {
                    const { product_id, quantity, isGuest } = payload;

                    // For logged-in users, the cart is already updated on the backend
                    // For guest users, we need to update the local cart
                    if (isGuest || !auth?.user?.user_id) {
                        onAddToCart?.(product_id, quantity);
                    }

                    // Show success message (optional, since AI already provides feedback)
                    console.log('Product added to cart:', product_id, quantity);
                }
            }
        } catch (error: Error | any) {
            console.error('Chat error:', error);
            const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: errorMessage,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center rounded-full bg-green-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-green-700"
                    aria-label="Open chat"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="flex h-[32rem] w-96 flex-col rounded-lg bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between rounded-t-lg bg-green-600 p-4 text-white">
                        <div>
                            <h3 className="font-semibold">Shopping Assistant</h3>
                            <p className="text-xs text-green-100">Powered by AI</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded p-1 transition-colors hover:bg-green-700"
                            aria-label="Close chat"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-lg bg-gray-100 p-3">
                                    <div className="flex space-x-2">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                        <div
                                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                            style={{ animationDelay: '0.1s' }}
                                        ></div>
                                        <div
                                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                            style={{ animationDelay: '0.2s' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t p-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                                className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
