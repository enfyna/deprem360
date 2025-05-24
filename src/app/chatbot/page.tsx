"use client";
import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    text: string | React.ReactNode; // Allow for both string and React components (like loading spinner)
    sender: 'user' | 'bot';
    isLoading?: boolean; // To indicate bot is typing
}

const ChatbotPage: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

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

        const newUserMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputText('');

        // Add a loading message from the bot
        const loadingBotMessageId = Date.now() + 1;
        const loadingBotMessage: Message = {
            id: loadingBotMessageId,
            text: <LoadingSpinner />,
            sender: 'bot',
            isLoading: true,
        };
        setMessages(prevMessages => [...prevMessages, loadingBotMessage]);

        // Simulate bot response
        setTimeout(() => {
            const botResponseText = `Yapay zeka yanıtı: "${newUserMessage.text}" sorunuz için hazırlandı.`; // Actual response
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === loadingBotMessageId
                        ? { ...msg, text: botResponseText, isLoading: false }
                        : msg
                )
            );
        }, 2500); // Increased delay to see loader
    };

    const handleClearAnswers = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)]">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
                    <img
                        src="/Deprem360.png"
                        alt="Deprem360 Logo"
                        className="w-30 h-20 sm:w-24 sm:h-24 mb-3 object-contain"
                    />
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Hoşgeldiniz, Ben 360
                    </h1>
                </div>

                {/* Messages Area */}
                <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto">
                    {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 space-y-1">
                        <span>Bugün size nasıl yardımcı olabilirim ?</span>
                    </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] sm:max-w-[60%] p-3 rounded-xl shadow ${
                                    msg.sender === 'user'
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
                                if (event.key === 'Enter') {
                                    handleAskQuestion();
                                }
                            }}
                        />
                        <button
                            onClick={handleAskQuestion}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Gönder
                        </button>
                    </div>
                    <button
                        onClick={handleClearAnswers}
                        className="w-full mt-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Yanıtları Temizle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;