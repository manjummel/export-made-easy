import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Paperclip, Mic, MicOff,
  Copy, Check, RefreshCw, Share2, Volume2,
  CheckCircle2, Plus, Settings
} from 'lucide-react';
import {
  sendConsultantQuery,
  streamConsultantQuery
} from '../services/aiService';
import { COMPANY } from '../data/dashboardData';
import { cn } from '../lib/cn';

// ── Simple Markdown Renderer ───────────────────────────────────────────────
function RenderText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        // numbered + bold: "1. **Title** – rest"
        const nm = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*[–—-]\s*(.+)$/);
        if (nm) {
          return (
            <div key={i} className="flex gap-2 text-base text-secondary">
              <span className="font-semibold text-primary shrink-0">{nm[1]}.</span>
              <span><strong className="text-primary">{nm[2]}</strong>{' — '}{nm[3]}</span>
            </div>
          );
        }
        // inline bold
        const parts = line.split(/\*\*(.+?)\*\*/g);
        if (parts.length > 1) {
          return (
            <p key={i} className="text-base text-secondary leading-relaxed">
              {parts.map((p, j) =>
                j % 2 === 1
                  ? <strong key={j} className="text-primary font-semibold">{p}</strong>
                  : p
              )}
            </p>
          );
        }
        if (!line.trim()) return <div key={i} className="h-2" />;
        return <p key={i} className="text-base text-secondary leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg, copiedId, onCopy }) {
  const isUser = msg.role === 'user';
  
  return (
    <div className={cn("w-full py-6", isUser ? "bg-transparent" : "bg-transparent")}>
      <div className="max-w-3xl mx-auto flex gap-4 px-4">
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border-medium)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)] shadow-sm">
              U
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
              <Bot size={18} className="text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="font-semibold text-primary text-sm mb-1">
            {isUser ? 'You' : 'ExportEase AI'}
          </div>
          
          <div className="text-base text-secondary prose prose-slate">
            {msg.text && <RenderText text={msg.text} />}
          </div>

          {/* Assistant Action Buttons */}
          {!isUser && (
            <div className="flex items-center gap-2 pt-2 text-[var(--text-muted)]">
              <button onClick={() => onCopy(msg)} className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] hover:text-[var(--text-primary)] transition-colors" title="Copy response">
                {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
              <button className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] hover:text-[var(--text-primary)] transition-colors" title="Regenerate">
                <RefreshCw size={14} />
              </button>
              <button className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] hover:text-[var(--text-primary)] transition-colors" title="Share">
                <Share2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Thinking Dots ──────────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div className="w-full py-6">
      <div className="max-w-3xl mx-auto flex gap-4 px-4">
        <div className="shrink-0 pt-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
            <Bot size={18} className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-indigo-400"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AIConsultant() {
  const [messages, setMessages]     = useState([]);
  const [inputText, setInputText]   = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId]     = useState(null);

  const chatEndRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      // Create an empty AI message placeholder
      const tempId = `resp-${Date.now()}`;
      setMessages((prev) => [...prev, { id: tempId, role: 'assistant', text: '' }]);
      setIsThinking(false);

      // Start streaming chunks into the placeholder
      await streamConsultantQuery(text, messages, (chunk) => {
        setMessages((prev) => 
          prev.map(msg => msg.id === tempId ? { ...msg, text: msg.text + chunk } : msg)
        );
      });
    } catch {
      setMessages((prev) => [...prev, { id: `resp-${Date.now()}`, role: 'assistant', text: "I'm sorry, I am having trouble connecting to the server right now." }]);
      setIsThinking(false);
    }
  };

  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg.text || '');
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const suggestedPrompts = [
      "Find the best export markets for my product",
      "Check export policy for UAE",
      "Generate export documents",
      "Analyze currency risk"
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-transparent" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Chat History ─────────────────────────────────────────────── */}
      <div 
        className="flex-1 overflow-y-auto pb-32"
        style={{ scrollbarWidth: 'none' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <Bot size={32} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-8">How can I help you today?</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {suggestedPrompts.map(prompt => (
                    <button 
                        key={prompt}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-4 py-3 rounded-xl border border-[var(--color-border-base)] text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)] transition-colors shadow-sm"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-12">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble msg={msg} copiedId={copiedId} onCopy={handleCopy} />
              </motion.div>
            ))}

            {isThinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ThinkingIndicator />
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Bar (Centered Floating) ────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)] to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl p-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden">
              <button
                type="button"
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 mb-1"
                title="Attach file"
              >
                <Plus size={20} />
              </button>
              
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                placeholder="Ask ExportEase AI anything..."
                disabled={isThinking}
                className="flex-1 max-h-32 min-h-[44px] bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none py-3"
                rows={1}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isThinking}
                className="mb-1 p-2 rounded-xl bg-[#1746D2] text-white hover:bg-[#1338a8] disabled:opacity-50 disabled:bg-[var(--surface-subtle)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            
            <p className="text-center text-xs text-[var(--text-muted)] mt-3">
                ExportEase AI can make mistakes. Consider verifying important trade regulations and data.
            </p>
        </div>
      </div>
    </div>
  );
}
