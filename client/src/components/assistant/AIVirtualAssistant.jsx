import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  Target,
  Maximize2,
  Minimize2,
  ChevronDown,
} from 'lucide-react';
import api from '../../services/api';

export default function AIVirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! I am your Kshamata AI Capacity Building Assistant for India\'s Official Statistical System. How can I help you today?',
      ts: new Date().toISOString(),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || loading) return;

    const userMsgObj = { role: 'user', content: textToSend, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsgObj]);
    if (!customText) setInputMsg('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: textToSend });
      const assistantMsgObj = {
        role: 'assistant',
        content: res.data.reply || 'I am processing your query.',
        ts: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsgObj]);
    } catch (err) {
      console.error('AI assistant chat failed:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Apologies, I am experiencing temporary connectivity issues with the ML service. Please try again shortly.',
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Explain my top skill gap', icon: Target, text: 'What is my top competency gap and why?' },
    { label: 'How is my score calculated?', icon: HelpCircle, text: 'How is my competency score calculated?' },
    { label: 'Recommend iGOT courses', icon: BookOpen, text: 'Recommend the best iGOT courses for my role.' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 ring-4 ring-emerald-500/20 group"
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
        </div>
        <span className="text-sm font-extrabold pr-1 hidden sm:inline">AI Capacity Assistant</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
        isMinimized
          ? 'w-80 h-16'
          : 'w-full max-w-sm sm:max-w-md h-[560px] max-h-[85vh]'
      }`}
    >
      {/* Drawer Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Kshamata AI Assistant
            </h3>
            <p className="text-[10px] text-slate-400">Context-Injected Learner Support</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-2 text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, i) => {
              const IconComp = qp.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.text)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <IconComp className="w-3 h-3 text-emerald-400" />
                  {qp.label}
                </button>
              );
            })}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI Assistant anything..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
