"use client";
import React, { useState, useEffect, useRef } from 'react';
import { financeApi } from '@/services/api';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIBotPage() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hello! I am your Valuation Assistant. I can help explain why Bajaj Finance is a BUY/HOLD/SELL and walk you through the DCF assumptions. How can I help today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [valuationData, setValuationData] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        financeApi.getValuation().then(res => setValuationData(res.data));
    }, []);

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setLoading(true);

        try {
            setTimeout(() => {
                let botResponse = "I'm analyzing the financial data for you...";

                const q = userText.toLowerCase();
                if (valuationData) {
                    if (q.includes('why') && q.includes('buy')) {
                        botResponse = `Based on our DCF model, the intrinsic value is ₹${parseFloat(valuationData.intrinsic_value_per_share).toFixed(2)}, which is higher than the current market price of ₹${valuationData.current_market_price}. This margin of safety leads to a ${valuationData.recommendation} signal.`;
                    } else if (q.includes('wacc')) {
                        botResponse = "The WACC used is 11.5%. This represents the required rate of return for investors, factoring in both the risk-free rate and the specific risk profile of Bajaj Finance.";
                    } else if (q.includes('revenue') || q.includes('growth')) {
                        botResponse = `Our model assumes a revenue growth rate of around 15-20% based on historical performance.`;
                    } else {
                        botResponse = "The system calculates intrinsic value by discounting future cash flows at a WACC of 11.5%. Would you like to know more about the forecast or the terminal value calculation?";
                    }
                } else {
                    botResponse = "I'm waiting for the valuation engine to finish its calculations. Once the data is ready, I can provide detailed insights into the Bajaj Finance model.";
                }

                setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
                setLoading(false);
            }, 1000);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the analysis engine right now." }]);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
            <header className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-white">AI Valuation Assistant</h2>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Interpretive Engine</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-500 max-w-[200px] text-right italic font-medium">
                    AI explanations are interpretive based on DCF models.
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-300'}`}>
                                {m.text}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 items-center text-slate-500 text-[10px] italic">
                            <Bot size={14} className="animate-pulse" />
                            AI is analyzing cash flows...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-white/5">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ask about the valuation, WACC, or growth assumptions..."
                        className="w-full pl-6 pr-14 py-4 bg-[#050505] border border-white/5 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
