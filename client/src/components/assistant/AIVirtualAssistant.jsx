import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  GraduationCap,
  HelpCircle,
  BookOpen,
  Target,
  Maximize2,
  Minimize2,
  Minus,
  GripHorizontal,
} from 'lucide-react';
import api from '../../services/api';

/**
 * Enterprise Formatted Markdown Renderer
 * Parses any heading levels (# to ######), bold (**text**), italics (*text*),
 * code (`code`), bullet lists, sub-numbered lists, and horizontal dividers.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  // Pre-process inline dividers like "text --- ### heading" into clean newlines
  const sanitizedText = text.replace(/\s+---\s+/g, '\n---\n');
  const lines = sanitizedText.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-0.5">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-relaxed">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-700 shrink-0 mt-1.5 shadow-2xs" />
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Dividers (---, ***, ___)
    if (/^([-*_]){3,}$/.test(line)) {
      flushList();
      elements.push(
        <div key={`hr-${i}`} className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      );
      return;
    }

    // Headings (any hash level #, ##, ###, ####, #####, ######)
    const headingMatch = line.match(/^(#{1,6})\s*(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingContent = headingMatch[2].trim();

      // Check if heading has a leading number like "1. iGOT Karmayogi Platform"
      const numberedMatch = headingContent.match(/^(\d+)\.\s*(.+)$/);

      if (numberedMatch) {
        elements.push(
          <div key={`h-${i}`} className="mt-3.5 mb-1.5 flex items-center gap-2 pt-1">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-tr from-slate-950 via-blue-900 to-blue-700 text-[10px] font-black text-white shadow-xs">
              {numberedMatch[1]}
            </div>
            <h4 className="text-xs font-bold text-slate-950 tracking-tight">
              {formatInline(numberedMatch[2])}
            </h4>
          </div>
        );
      } else if (level <= 3) {
        elements.push(
          <h4 key={`h-${i}`} className="text-xs font-bold text-slate-950 mt-3.5 mb-1.5 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-1">
            <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-blue-700 to-slate-950 inline-block shrink-0" />
            <span>{formatInline(headingContent)}</span>
          </h4>
        );
      } else {
        elements.push(
          <h5 key={`h-${i}`} className="text-xs font-bold text-slate-900 mt-2.5 mb-1 tracking-tight flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-blue-600 inline-block shrink-0" />
            <span>{formatInline(headingContent)}</span>
          </h5>
        );
      }
      return;
    }

    // Bullet points or numbered items
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ') || /^\d+\.\s/.test(line)) {
      inList = true;
      const cleanItem = line.replace(/^([-*•]|\d+\.)\s*/, '');
      listItems.push(cleanItem);
      return;
    }

    // Regular line
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs text-slate-800 leading-relaxed my-1">
        {formatInline(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}

function formatInline(str) {
  if (!str) return '';
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-bold text-slate-950">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-blue-900 border border-slate-200 font-bold">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700 font-medium">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }

  return parts.length > 0 ? parts : str;
}

export default function AIVirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! I am **Sahayak (सहायक)** — your Kshamata AI Statistical Capacity Mentor for India's Official Statistical System.\n\n**What I can help with:**\n- Diagnosing competency gaps & role targets\n- Socratic learning & statistical quiz walkthroughs\n- iGOT courses & NSSTA TPAC programme pathways\n- Official statistical concepts (SNA 2008, NSS Sampling, CPI/WPI, NQAF)\n\n**Governance Safeguards:**\n- Strict guardrails: No administrative HR actions or policy decisions\n- Grounded responses based on approved MoSPI authorities\n- Zero-PII leakage with pseudonymized audit trails\n\nHow can I assist your statistical learning journey today?",
      ts: new Date().toISOString(),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Smooth position & dimension states
  const [dimensions, setDimensions] = useState({ width: 460, height: 580 });
  const [position, setPosition] = useState(null); // null = anchored bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null);

  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, initialW: 0, initialH: 0, initialX: 0, initialY: 0, hasCustomPos: false });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Drag start from header
  const handleMouseDownDrag = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    const modalEl = document.getElementById('kshamata-assistant-modal');
    const rect = modalEl ? modalEl.getBoundingClientRect() : { left: window.innerWidth - dimensions.width - 24, top: window.innerHeight - dimensions.height - 24 };
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
  };

  // Resize start from any handle
  const handleMouseDownResize = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(direction);
    const modalEl = document.getElementById('kshamata-assistant-modal');
    const rect = modalEl ? modalEl.getBoundingClientRect() : { left: window.innerWidth - dimensions.width - 24, top: window.innerHeight - dimensions.height - 24 };
    
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialW: dimensions.width,
      initialH: dimensions.height,
      initialX: rect.left,
      initialY: rect.top,
      hasCustomPos: position !== null,
      direction,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
          x: Math.max(10, Math.min(window.innerWidth - dimensions.width - 10, dragRef.current.initialX + dx)),
          y: Math.max(10, Math.min(window.innerHeight - dimensions.height - 10, dragRef.current.initialY + dy)),
        });
      }

      if (isResizing) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const dir = resizeRef.current.direction;

        let newW = resizeRef.current.initialW;
        let newH = resizeRef.current.initialH;
        let newX = resizeRef.current.initialX;
        let newY = resizeRef.current.initialY;

        const minW = 340;
        const maxW = Math.min(920, window.innerWidth - 24);
        const minH = 380;
        const maxH = Math.min(880, window.innerHeight - 24);

        if (dir.includes('e')) {
          newW = Math.max(minW, Math.min(maxW, resizeRef.current.initialW + dx));
        }
        if (dir.includes('w')) {
          const proposedW = resizeRef.current.initialW - dx;
          newW = Math.max(minW, Math.min(maxW, proposedW));
          if (resizeRef.current.hasCustomPos) {
            newX = resizeRef.current.initialX + (resizeRef.current.initialW - newW);
          }
        }
        if (dir.includes('s')) {
          newH = Math.max(minH, Math.min(maxH, resizeRef.current.initialH + dy));
        }
        if (dir.includes('n')) {
          const proposedH = resizeRef.current.initialH - dy;
          newH = Math.max(minH, Math.min(maxH, proposedH));
          if (resizeRef.current.hasCustomPos) {
            newY = resizeRef.current.initialY + (resizeRef.current.initialH - newH);
          }
        }

        setDimensions({ width: newW, height: newH });
        if (resizeRef.current.hasCustomPos && (dir.includes('w') || dir.includes('n'))) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dimensions, position]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || loading) return;

    const userMsgObj = { role: 'user', content: textToSend, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsgObj]);
    if (!customText) setInputMsg('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: textToSend });
      
      // Extract response data
      const reply = res.data.reply || 'I am processing your query.';
      const citations = res.data.citations || [];
      const refusal = res.data.refusal || false;
      const scopeClassification = res.data.scopeClassification || 'unknown';
      const safePrompts = res.data.safePrompts || [];

      // Build response content with citations if available
      let responseContent = reply;
      if (citations && citations.length > 0) {
        const citationsBlock = citations
          .map(c => `- **${c.title}** ${c.url ? `([Link](${c.url}))` : ''}`)
          .join('\n');
        responseContent = `${reply}\n\n---\n**Sources:**\n${citationsBlock}`;
      }

      const assistantMsgObj = {
        role: 'assistant',
        content: responseContent,
        refusal,
        scopeClassification,
        safePrompts,
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsgObj]);
    } catch (err) {
      console.error('AI assistant chat failed:', err);
      
      // Handle different error types
      let errorMessage = 'I encountered an error processing your request. Please try again shortly.';
      if (err.response?.status === 429) {
        errorMessage = 'You\'ve sent too many messages. Please wait a moment before sending another.';
      } else if (err.response?.status === 413) {
        errorMessage = 'Your message is too long. Please keep it under 5KB.';
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          refusal: true,
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'My priority skill gaps & role targets', icon: Target, text: 'What is my top skill gap?' },
    { label: 'Test my knowledge: NSS Stratified Sampling (Socratic)', icon: HelpCircle, text: 'Test my understanding of Stratified Sampling' },
    { label: 'Explain SNA 2008 GVA deflation methodology', icon: BookOpen, text: 'Explain SNA 2008 GVA deflation' },
    { label: 'Recommend upcoming NSSTA programmes', icon: GraduationCap, text: 'Which courses and NSSTA programmes are recommended for me?' },
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-center justify-center">
        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-slate-950 via-blue-900 to-slate-950 animate-pulse opacity-80 blur-xs"></span>
        <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-900 to-slate-950 animate-ping opacity-40"></span>

        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-blue-500/60 shadow-blue-950/50 group cursor-pointer"
          title="Open Sahayak (सहायक) AI Statistical Mentor"
        >
          <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  const effectiveWidth = isExpanded ? Math.min(760, window.innerWidth - 30) : dimensions.width;
  const effectiveHeight = isExpanded ? Math.min(720, window.innerHeight - 40) : dimensions.height;

  const windowStyle = isMinimized
    ? { width: '320px', height: '56px' }
    : {
        width: `${effectiveWidth}px`,
        height: `${effectiveHeight}px`,
        ...(position
          ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
          : {}),
      };

  return (
    <div
      id="kshamata-assistant-modal"
      style={windowStyle}
      className={`fixed z-50 bg-white/98 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl transition-all duration-100 flex flex-col overflow-hidden group ${
        position ? '' : 'bottom-6 right-6'
      }`}
    >
      {/* ── Ultra-Sleek Multi-Side Resize Handles with Invisible Grab Zones & Hover Feedback ── */}
      {!isMinimized && !isExpanded && (
        <>
          {/* Top Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'n')}
            className="absolute top-0 left-3 right-3 h-2 cursor-n-resize z-20 hover:bg-blue-500/20 transition-colors"
          />
          {/* Left Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'w')}
            className="absolute top-3 left-0 bottom-3 w-2 cursor-w-resize z-20 hover:bg-blue-500/20 transition-colors"
          />
          {/* Right Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-3 right-0 bottom-3 w-2 cursor-e-resize z-20 hover:bg-blue-500/20 transition-colors"
          />
          {/* Bottom Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize z-20 hover:bg-blue-500/20 transition-colors"
          />

          {/* Top-Left Corner Handle */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-30 flex items-start justify-start p-0.5 opacity-60 hover:opacity-100"
          >
            <div className="w-1.5 h-1.5 border-t border-l border-blue-400 rounded-tl-sm" />
          </div>
          {/* Top-Right Corner Handle */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-30"
          />
          {/* Bottom-Left Corner Handle */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-30"
          />
          {/* Bottom-Right Corner Handle (Sleek Dot Grip) */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-30 flex items-end justify-end p-1 opacity-50 hover:opacity-100"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400" />
          </div>
        </>
      )}

      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDownDrag}
        className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-white border border-blue-400/30 shadow-xs">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 tracking-tight">
              Sahayak (सहायक) <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/30 text-blue-200 rounded font-semibold border border-blue-400/30">AI Mentor</span>
            </h3>
            <p className="text-[10px] text-slate-300 font-medium">MoSPI Statistical Capacity Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <GripHorizontal className="w-4 h-4 text-slate-500 mr-1 hidden sm:block opacity-60" />
          
          {/* Maximize / Restore Toggle (Hidden when window is minimized) */}
          {!isMinimized && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Restore Normal Size' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Minimize to Taskbar / Expand Toggle */}
          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
              if (isExpanded) setIsExpanded(false);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer"
            title={isMinimized ? 'Expand Window' : 'Minimize to Taskbar'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          {/* Close Window */}
          <button
            onClick={() => {
              setIsOpen(false);
              setPosition(null);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors cursor-pointer"
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
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#1E3A8A] text-white rounded-tr-none font-semibold'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <span>{msg.content}</span>
                  ) : (
                    <FormattedMessage text={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {/* Quick Action Options List */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Suggested Prompts
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {quickPrompts.map((qp, i) => {
                    const IconComp = qp.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(qp.text)}
                        className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-900 flex items-center gap-2.5 transition-all shadow-xs group cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
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
                <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <Bot className="w-3.5 h-3.5" />
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
          <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about skills, courses, or scores..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              className="p-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] disabled:opacity-40 text-white font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
