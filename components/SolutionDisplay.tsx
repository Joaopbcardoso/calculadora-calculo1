import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface SolutionDisplayProps {
  content: string;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center space-x-3">
        <div className="bg-green-500/20 text-green-400 p-2 rounded-lg">
          <i className="fas fa-check-circle text-xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Solução Passo a Passo</h2>
      </div>
      
      <div className="p-6 text-slate-300 leading-relaxed text-lg">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          className="prose prose-invert prose-lg max-w-none prose-headings:text-indigo-300 prose-strong:text-white prose-code:text-teal-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700"
          components={{
            // Custom renderer for paragraphs to ensure math doesn't get messed up
            p: ({children}) => <p className="mb-4 text-slate-300">{children}</p>,
            // Style h1/h2/h3
            h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 border-b border-slate-700 pb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-xl font-bold text-indigo-200 mb-3 mt-5">{children}</h2>,
            h3: ({children}) => <h3 className="text-lg font-semibold text-teal-200 mb-2 mt-4">{children}</h3>,
            ul: ({children}) => <ul className="list-disc list-inside space-y-2 mb-4 ml-2">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside space-y-2 mb-4 ml-2">{children}</ol>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};