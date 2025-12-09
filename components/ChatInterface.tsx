
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Button } from './Button';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className="bg-teal-500/20 text-teal-400 p-2 rounded-lg">
                <i className="fas fa-comments"></i>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-100">Dúvidas?</h2>
                <p className="text-xs text-slate-400">Pergunte ao professor sobre a solução</p>
            </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto min-h-[200px] bg-slate-800/50">
        {messages.length === 0 && (
            <div className="text-center text-slate-500 py-8 italic">
                Não entendeu algum passo? Digite sua dúvida abaixo.
            </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
               msg.role === 'user'
                 ? 'bg-indigo-600 text-white rounded-tr-none'
                 : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
             }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="prose prose-invert prose-sm max-w-none prose-p:mb-2 last:prose-p:mb-0"
                >
                  {msg.content}
                </ReactMarkdown>
             </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-slate-700 text-slate-400 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2 border border-slate-600">
               <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: Por que você cortou o x no passo 2?"
          className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
          disabled={isLoading}
        />
        <Button 
            type="submit" 
            variant="accent" 
            isLoading={false} 
            disabled={!input.trim() || isLoading}
            className="rounded-xl px-4"
        >
           <i className="fas fa-paper-plane"></i>
        </Button>
      </form>
    </div>
  );
};
