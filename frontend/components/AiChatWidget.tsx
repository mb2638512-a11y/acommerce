
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Sparkles, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { Store } from '../types';

interface AiChatWidgetProps {
    store: Store;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ store }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', text: `Hi! I'm ${store.name}'s AI assistant. How can I help you today?`, sender: 'ai', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Prepare context
        const context = {
            storeName: store.name,
            niche: store.niche,
            currency: store.settings.currency,
            supportEmail: store.settings.contactPage?.email,
            products: store.products.slice(0, 10).map(p => ({ name: p.name, price: p.price }))
        };

        const responseText = await chatWithAI(userMsg.text, context);

        const aiMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai', timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-fade-in origin-bottom-right mb-2" style={{ maxHeight: '600px', height: '80vh' }}>

                    {/* Header */}
                    <div className={`p-4 bg-${store.themeColor}-600 text-white flex justify-between items-center`}>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg"><Sparkles size={18} /></div>
                            <div>
                                <h3 className="font-bold text-sm">AI Support</h3>
                                <p className="text-xs opacity-80">Always here to help</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={18} /></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-gray-200 dark:bg-gray-700' : `bg-${store.themeColor}-100 dark:bg-${store.themeColor}-900/30 text-${store.themeColor}-600`}`}>
                                    {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? `bg-${store.themeColor}-600 text-white rounded-tr-none shadow-md shadow-${store.themeColor}-500/20` : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-${store.themeColor}-100 dark:bg-${store.themeColor}-900/30 text-${store.themeColor}-600`}>
                                    <Sparkles size={14} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        <input
                            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Ask a question..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className={`p-2 bg-${store.themeColor}-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-${store.themeColor}-500/30`}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 bg-${store.themeColor}-600 text-white rounded-full shadow-xl shadow-${store.themeColor}-600/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};
