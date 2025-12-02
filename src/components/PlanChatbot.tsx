import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/foodplan.module.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface PlanChatbotProps {
    planId: number;
    onPlanUpdate: (data: any) => void;
}

const PlanChatbot: React.FC<PlanChatbotProps> = ({ planId, onPlanUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', content: 'Hi! I can help you modify your meal plan. Try saying "Replace oatmeal with eggs" or "Add a banana to lunch".' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    message: userMessage.content
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Update parent with new plan data if provided
            if (data.plan && data.summary && data.groupedFoods) {
                onPlanUpdate(data);
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                className={`${styles.chatToggle} ${isOpen ? styles.chatToggleOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chat"
            >
                💬 AI Assistant
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <h3>Plan Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className={styles.closeChat}>×</button>
                    </div>

                    <div className={styles.messagesList}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                                <div className={styles.messageContent}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.typingIndicator}>
                                    <span>•</span><span>•</span><span>•</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.chatInputForm}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isLoading}
                            className={styles.chatInput}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className={styles.sendButton}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default PlanChatbot;
