
import React, { useState } from 'react';
import { CalcMode, ChatMessage } from './types';
import { MathInput } from './components/MathInput';
import { SolutionDisplay } from './components/SolutionDisplay';
import { ChatInterface } from './components/ChatInterface';
import { solveMathProblem, solveFollowUpQuestion } from './services/geminiService';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<CalcMode | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State for Context and Chat
  const [lastProblem, setLastProblem] = useState<{text: string, image: string | null} | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Home Screen Selection
  if (!currentMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-md w-full text-center space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400 pb-2">
              CalcMaster AI
            </h1>
            <p className="text-slate-400 text-lg">
              Sua calculadora inteligente para Cálculo 1
            </p>
          </div>

          <div className="grid gap-4 w-full">
            <button
              onClick={() => setCurrentMode(CalcMode.LIMITS)}
              className="group relative w-full h-24 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-teal-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-between px-8">
                <span className="text-2xl font-bold text-teal-100">Limites</span>
                <i className="fas fa-chart-line text-3xl text-teal-400/50 group-hover:text-teal-400 transition-colors"></i>
              </div>
            </button>

            <button
              onClick={() => setCurrentMode(CalcMode.DERIVATIVES)}
              className="group relative w-full h-24 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-between px-8">
                <span className="text-2xl font-bold text-indigo-100">Derivadas</span>
                <i className="fas fa-superscript text-3xl text-indigo-400/50 group-hover:text-indigo-400 transition-colors"></i>
              </div>
            </button>

            <button
              onClick={() => setCurrentMode(CalcMode.INTEGRALS)}
              className="group relative w-full h-24 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-800 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-between px-8">
                <span className="text-2xl font-bold text-purple-100">Integrais</span>
                <i className="fas fa-integral text-3xl text-purple-400/50 group-hover:text-purple-400 transition-colors"></i>
              </div>
            </button>
          </div>

          <p className="text-xs text-slate-600 pt-8">
            Desenvolvido com Google Gemini 2.5 Flash
          </p>
        </div>
      </div>
    );
  }

  // Calculator Logic
  const handleCalculate = async (inputText: string, inputImage: string | null) => {
    if (!inputText && !inputImage) return;
    
    setLoading(true);
    setSolution(null);
    setChatMessages([]); // Reset chat
    setLastProblem({ text: inputText, image: inputImage });

    try {
      const result = await solveMathProblem(inputText, currentMode, inputImage || undefined);
      setSolution(result);
    } catch (error) {
      console.error(error);
      setSolution("Erro ao calcular. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (msg: string) => {
    if (!solution || !lastProblem) return;

    // Add user message immediately
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const response = await solveFollowUpQuestion(
        lastProblem.text + (lastProblem.image ? " [Com Imagem]" : ""),
        solution,
        chatMessages, // Send previous history
        msg
      );
      
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
       console.error(error);
       setChatMessages(prev => [...prev, { role: 'model', content: "Erro ao responder. Tente novamente." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const goBack = () => {
    setCurrentMode(null);
    setSolution(null);
    setLastProblem(null);
    setChatMessages([]);
  };

  const getModeColor = (mode: CalcMode) => {
    switch (mode) {
      case CalcMode.LIMITS: return "text-teal-400";
      case CalcMode.DERIVATIVES: return "text-indigo-400";
      case CalcMode.INTEGRALS: return "text-purple-400";
      default: return "text-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center">
        <button 
          onClick={goBack}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className={`ml-4 text-xl font-bold ${getModeColor(currentMode)}`}>
          Calculadora de {currentMode}
        </h1>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-4 pt-6 space-y-6">
        
        {/* Info Box */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-start space-x-3">
          <i className="fas fa-info-circle text-slate-400 mt-1"></i>
          <p className="text-sm text-slate-300">
            Use o teclado matemático abaixo para montar sua equação ou envie uma foto.
          </p>
        </div>

        {/* Input Area */}
        <MathInput
          mode={currentMode}
          onSubmit={handleCalculate}
          isLoading={loading}
        />

        {/* Output Area */}
        {solution && (
          <div className="animate-fade-in-up space-y-8">
            <SolutionDisplay content={solution} />
            
            {/* Chat Interface */}
            <ChatInterface 
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={chatLoading}
            />

            {/* Reset Button */}
            <div className="flex justify-center pb-10">
              <button 
                onClick={() => {
                  setSolution(null);
                  setChatMessages([]);
                }}
                className="text-slate-500 hover:text-slate-300 text-sm font-medium underline underline-offset-4"
              >
                Calcular outro problema
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
