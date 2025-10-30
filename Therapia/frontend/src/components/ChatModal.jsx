import React, { useEffect, useRef, useState } from 'react';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose, mode = 'home', productGeneric = '' }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // { role: 'user'|'ai', text }
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesBoxRef = useRef(null);
  const chatModalRef = useRef(null);

  // Only clear messages when explicitly closed (not when minimized)
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = messagesBoxRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Handle click outside to minimize (not close)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !isMinimized && chatModalRef.current && !chatModalRef.current.contains(event.target)) {
        setIsMinimized(true);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMinimized]);

  if (!isOpen) return null;

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const handleClose = () => {
    // Clear messages only when explicitly closed
    setInput('');
    setMessages([]);
    setSending(false);
    setIsMinimized(false);
    onClose();
  };

  const buildPrompt = (question) => {
    const persona = [
      'Act as a professional pharmacy store assistant in Bangladesh.',
      'Context: Medicine.',
      'Ensure responses are medically appropriate and compliant with Bangladeshi pharmaceutical guidelines.',
      'If the query is outside medicine or knowledge is insufficient, reply exactly one of:',
      '1) This query falls outside my training data as a pharmacy chatbot',
      '2) I don\'t have sufficient information about this medication',
      'Maintain a helpful and professional tone throughout.',
      'End with one short sentence advising consultation with qualified healthcare professionals.',
    ].join(' ');

    const style = 'Answer in 60-100 words, single paragraph, no bold/italic/underline, specific to the user\'s query.';

    if (mode === 'product') {
      const generic = String(productGeneric || '').trim();
      return `${generic ? `Generic: ${generic}\n` : ''}User question: ${question}\nPersona: ${persona}\nInstructions: ${style}`;
    }
    // home mode: no generic included
    return `User question: ${question}\nPersona: ${persona}\nInstructions: ${style}`;
  };

  const send = async () => {
    const question = input.trim();
    if (!question) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setSending(true);
    try {
      const prompt = buildPrompt(question);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Chat request failed');
      const aiText = String(data?.text || '').trim();
      setMessages((m) => [...m, { role: 'ai', text: aiText || 'No response' }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chatmodal-overlay" role="dialog" aria-modal="true" aria-label="Therapeia Chatbot">
      <div 
        ref={chatModalRef}
        className={`chatmodal ${isMinimized ? 'chatmodal-minimized' : ''}`}
      >
        <div className="chatmodal-header" onClick={isMinimized ? handleMaximize : undefined}>
          <div className="chatmodal-title">
            TherapAI
            {isMinimized && messages.length > 0 && (
              <span className="chatmodal-message-count">({messages.length})</span>
            )}
          </div>
          <div className="chatmodal-controls">
            {!isMinimized && (
              <button 
                className="chatmodal-minimize" 
                onClick={handleMinimize} 
                aria-label="Minimize chat"
                title="Minimize"
              >
                −
              </button>
            )}
            <button 
              className="chatmodal-close" 
              onClick={handleClose} 
              aria-label="Close chat"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        {!isMinimized && (
          <div className="chatmodal-body">
            <div className="chatmodal-messages" ref={messagesBoxRef}>
              {messages.length === 0 ? (
                <div className="chatmodal-empty">Ask about your medicine...</div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`chatbubble ${m.role}`}>{m.text}</div>
                ))
              )}
            </div>
            <div className="chatmodal-inputrow">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'product' ? 'Compose your message...' : 'Compose your message...'}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                className="chatmodal-input"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="chatmodal-send"
              >{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;