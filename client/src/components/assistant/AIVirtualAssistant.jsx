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
  GripHorizontal,
} from 'lucide-react';
import api from '../../services/api';

export default function AIVirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! I am your Kshamata AI Capacity Building Assistant for India's Official Statistical System. How can I help you today?",
      ts: new Date().toISOString(),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Dragging state
  const [position, setPosition] = useState(null); // { x, y }
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    // Only drag when clicking header area
    if (e.target.closest('button')) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 380, dragRef.current.initialX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 500, dragRef.current.initialY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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

  // Sleek Circular Corner Launcher Button when Closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-center justify-center">
        {/* Pulsing Dark Black-Blue Gradient Border Aura */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-slate-950 via-blue-900 to-slate-950 animate-pulse opacity-80 blur-xs"></span>
        <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-900 to-slate-950 animate-ping opacity-40"></span>

        {/* Main Circular Launcher Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-blue-500/60 shadow-blue-950/50 group"
          title="Open Kshamata AI Assistant"
        >
          <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  const windowStyle = position
    ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
    : {};

  return (
    <div
      style={windowStyle}
      className={`fixed z-50 bg-white border border-slate-200/90 rounded-2xl shadow-2xl transition-shadow duration-200 flex flex-col overflow-hidden ${
        position ? '' : 'bottom-6 right-6'
      } ${
        isMinimized
          ? 'w-80 h-16'
          : 'w-full max-w-sm sm:max-w-md h-[560px] max-h-[85vh]'
      }`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-white border border-blue-400/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 tracking-tight">
              Kshamata AI Assistant
            </h3>
            <p className="text-[10px] text-slate-300 font-semibold">MoSPI Competency Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <GripHorizontal className="w-4 h-4 text-slate-500 mr-1 hidden sm:block" />
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setPosition(null); // Reset drag position on close
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] p-3.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Quick Action Options List (Clean vertical stack inside chat flow) */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                  Suggested Prompts
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {quickPrompts.map((qp, i) => {
                    const IconComp = qp.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(qp.text)}
                        className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-900 flex items-center gap-2.5 transition-all shadow-xs group"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span>{qp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start items-center gap-2.5 text-slate-500 text-xs py-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Box */}
          <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI Assistant anything..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
