// components/FloatingChatbot.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/axios'; // API istemcinizi import edin

interface Message {
    id: number;
    text: string | React.ReactNode;
    sender: 'user' | 'bot';
    isLoading?: boolean;
}

const FloatingChatbot: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsChatOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const LoadingSpinner: React.FC = () => (
        <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse delay-0"></div>
            <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse delay-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse delay-400"></div>
        </div>
    );

    const handleAskQuestion = async () => {
        if (inputText.trim() === '') return;

        const userMessageText = inputText; // Store before clearing
        const newUserMessage: Message = {
            id: Date.now(),
            text: userMessageText,
            sender: 'user',
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputText('');

        const loadingBotMessageId = Date.now() + 1;
        const loadingBotMessage: Message = {
            id: loadingBotMessageId,
            text: <LoadingSpinner />,
            sender: 'bot',
            isLoading: true,
        };
        setMessages(prevMessages => [...prevMessages, loadingBotMessage]);
        scrollToBottom(); // Scroll after adding user and loading messages

        try {
            const response = await api.post('/ai/chat', {
                aiChat: {
                    input: userMessageText
                }
            });

            const botResponseText = response.data.output;

            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === loadingBotMessageId
                        ? { ...msg, text: botResponseText, isLoading: false }
                        : msg
                )
            );
        } catch (error) {
            console.error("API isteği başarısız:", error);
            const errorMessage = "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === loadingBotMessageId
                        ? { ...msg, text: errorMessage, isLoading: false }
                        : msg
                )
            );
        }
        scrollToBottom(); // Scroll again after bot response or error
    };

    const handleClearAnswers = () => {
        setMessages([]);
    };

    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    };

    // ... (JSX kısmı aynı kalacak, buraya eklemiyorum)
    // Önceki yanıttaki JSX'i kullanabilirsiniz.
    // Sadece handleAskQuestion fonksiyonu değişti.

    return (
        <>
            {/* Chat Window */}
            <div
                className={`fixed bottom-[calc(4rem+1.5rem)] right-5 sm:bottom-[calc(5rem+1.5rem)] sm:right-6
                            w-[90vw] max-w-md h-[70vh] max-h-[500px] sm:max-h-[600px]
                            bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col
                            transition-all duration-300 ease-in-out transform z-50
                            ${isChatOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/Deprem360.png" // Ensure this path is correct (e.g., in public folder)
                            alt="Deprem360 Logo"
                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                        <h1 className="text-md sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Ben 360, Nasıl yardımcı olabilirim?
                        </h1>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Sohbeti kapat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 space-y-1 h-full">
                            <span>Bugün size nasıl yardımcı olabilirim?</span>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] sm:max-w-[70%] p-3 rounded-xl shadow ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                                    }`}
                            >
                                {msg.isLoading ? <LoadingSpinner /> : msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <input
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="Sorunuzu buraya yazın..."
                            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            onKeyPress={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault(); // Prevent new line on enter
                                    handleAskQuestion();
                                }
                            }}
                        />
                        <button
                            onClick={handleAskQuestion}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            aria-label="Gönder"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearAnswers}
                            className="w-full mt-3 p-2 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-red-400"
                        >
                            Yanıtları Temizle
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Action Button (FAB) */}
            <button
                onClick={toggleChat}
                className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6
                           bg-blue-600 hover:bg-blue-700 text-white
                           w-16 h-16 rounded-full shadow-xl
                           flex items-center justify-center
                           transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-opacity-75 z-50"
                aria-label={isChatOpen ? "Sohbeti kapat" : "Sohbeti aç"}
            >
                {isChatOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.862 8.25-8.625 8.25S3.75 16.556 3.75 12c0-4.556 3.862-8.25 8.625-8.25S21 7.444 21 12z" />
                    </svg>
                )}
            </button>
        </>
    );
};

export default FloatingChatbot;