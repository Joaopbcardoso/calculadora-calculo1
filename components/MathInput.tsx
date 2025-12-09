import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';
import { CalcMode } from '../types';

// Wrapper for custom element to avoid TypeScript JSX issues
const MathField = React.forwardRef<any, any>((props, ref) => {
  return React.createElement('math-field', { ...props, ref });
});

interface MathInputProps {
  mode: CalcMode;
  onSubmit: (text: string, image: string | null) => void;
  isLoading: boolean;
}

const MATH_KEYS = {
  trig: [
    { label: 'sin', cmd: '\\sin' }, { label: 'cos', cmd: '\\cos' }, { label: 'tan', cmd: '\\tan' },
    { label: 'csc', cmd: '\\csc' }, { label: 'sec', cmd: '\\sec' }, { label: 'cot', cmd: '\\cot' },
    { label: 'θ', cmd: '\\theta' }, { label: 'α', cmd: '\\alpha' }, { label: 'β', cmd: '\\beta' },
    { label: 'π', cmd: '\\pi' }, { label: 'e', cmd: 'e' }, { label: 'ln', cmd: '\\ln' },
  ],
  ops: [
    { label: 'frac', cmd: '\\frac' }, { label: '(', cmd: '(' }, { label: ')', cmd: ')' },
    { label: 'x²', cmd: '^2' }, { label: 'xⁿ', cmd: '^' }, { label: '√', cmd: '\\sqrt' },
    { label: '+', cmd: '+' }, { label: '-', cmd: '-' }, { label: '*', cmd: '\\cdot' },
    { label: 'log', cmd: '\\log' }, { label: '|x|', cmd: '|#0|' }, { label: 'eˣ', cmd: 'e^' },
  ],
  calc: [
    { label: 'lim', cmd: '\\lim_{x \\to \\infty}' }, { label: 'Σ', cmd: '\\sum' }, { label: '∞', cmd: '\\infty' },
    { label: '∫', cmd: '\\int' }, { label: 'd/dx', cmd: '\\frac{d}{dx}' }, { label: 'dx', cmd: 'dx' },
  ]
};

export const MathInput: React.FC<MathInputProps> = ({
  mode,
  onSubmit,
  isLoading
}) => {
  // Refs for the MathLive fields
  const mainFieldRef = useRef<any>(null);
  const limitTargetRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Track which field was last focused to insert symbols into the correct one
  const lastFocusedRef = useRef<any>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trig' | 'ops' | 'calc'>('ops');
  
  // State to force re-render when inputs change (for validation)
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    // Set initial focus
    if (mode === CalcMode.LIMITS) {
      // Small delay to ensure web component is ready
      setTimeout(() => {
        if (mainFieldRef.current) lastFocusedRef.current = mainFieldRef.current;
      }, 100);
    } else {
      setTimeout(() => {
        if (mainFieldRef.current) {
          lastFocusedRef.current = mainFieldRef.current;
          mainFieldRef.current.focus();
        }
      }, 100);
    }
  }, [mode]);

  // Handle Input Changes to update validation state
  const handleInput = () => {
    const mainVal = mainFieldRef.current?.getValue() || '';
    setHasContent(mainVal.length > 0);
  };

  const handleFocus = (ref: React.RefObject<any>) => {
    lastFocusedRef.current = ref.current;
  };

  const insertCommand = (cmd: string) => {
    const field = lastFocusedRef.current || mainFieldRef.current;
    if (field) {
      field.focus();
      // Special handling for some commands to be more intuitive
      if (cmd === '\\frac') {
         // Insert an empty fraction and move cursor to numerator
         field.executeCommand('insert', '\\frac{#@}{#?}');
      } else if (cmd === '|#0|') {
        field.executeCommand('insert', '|#0|');
      } else {
         field.executeCommand('insert', cmd);
      }
      handleInput();
    }
  };

  const handleSubmit = () => {
    const mainLatex = mainFieldRef.current?.getValue() || '';
    
    let finalPrompt = mainLatex;

    if (mode === CalcMode.LIMITS) {
      const targetLatex = limitTargetRef.current?.getValue() || '0';
      // Construct a clean LaTeX string for the limit
      finalPrompt = `\\lim_{x \\to ${targetLatex}} \\left( ${mainLatex} \\right)`;
    }

    onSubmit(finalPrompt, selectedImage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearAll = () => {
    if (mainFieldRef.current) mainFieldRef.current.setValue('');
    if (limitTargetRef.current) limitTargetRef.current.setValue('');
    setSelectedImage(null);
    setHasContent(false);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* INPUT AREA */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-inner ring-1 ring-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        
        {mode === CalcMode.LIMITS ? (
          // --- LIMIT SPECIAL LAYOUT ---
          <div className="flex flex-row items-center p-6 space-x-3 bg-slate-900/50 min-h-[150px]">
            {/* The "lim x->a" part */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-3xl font-serif italic font-bold text-slate-200 leading-none">lim</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-slate-400 font-serif italic mr-1">x &#8594;</span>
                {/* Target Field (Visual Math Field) */}
                <div className="w-16 border-b border-slate-600">
                  <MathField
                    ref={limitTargetRef}
                    onInput={handleInput}
                    onFocus={() => handleFocus(limitTargetRef)}
                    virtual-keyboard-mode="manual"
                    style={{ fontSize: '0.9rem', padding: '0px' }}
                  >
                    0
                  </MathField>
                </div>
              </div>
            </div>

            {/* The Main Expression Field */}
            <div className="flex-1 flex items-center border-l-2 border-slate-700 pl-4 min-h-[80px]">
              <MathField
                ref={mainFieldRef}
                onInput={handleInput}
                onFocus={() => handleFocus(mainFieldRef)}
                virtual-keyboard-mode="manual"
                placeholder="(x² - 1)"
              ></MathField>
            </div>
          </div>
        ) : (
          // --- STANDARD LAYOUT (Derivatives/Integrals) ---
          <div className="p-4 min-h-[150px] flex items-center">
             <MathField
                ref={mainFieldRef}
                onInput={handleInput}
                onFocus={() => handleFocus(mainFieldRef)}
                virtual-keyboard-mode="manual"
                placeholder={mode === CalcMode.INTEGRALS ? "\\int x^2 dx" : "\\frac{d}{dx} (x^2)"}
              ></MathField>
          </div>
        )}

        {/* Toolbar (Photo + Clear) */}
        <div className="flex justify-between items-center bg-slate-800 px-3 py-2 border-t border-slate-700">
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedImage 
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/50" 
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <i className="fas fa-camera"></i>
              <span>{selectedImage ? "Foto Anexada" : "Foto"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedImage && (
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
          <button 
            onClick={clearAll}
            className="text-slate-500 hover:text-white px-3 text-sm transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* VIRTUAL KEYBOARD */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden select-none shadow-lg">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/30">
          {(['trig', 'ops', 'calc'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-colors relative ${
                activeTab === tab 
                  ? 'text-teal-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'trig' ? 'Trigonometria' : tab === 'ops' ? 'Operações' : 'Cálculo'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 mx-8 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Keys Grid */}
        <div className="p-3 grid grid-cols-4 gap-2 bg-slate-800">
          {MATH_KEYS[activeTab].map((key) => (
            <button
              key={key.label}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent taking focus away from the math-field
                insertCommand(key.cmd);
              }}
              className="h-12 rounded-lg bg-slate-700 hover:bg-slate-600 hover:shadow-md active:translate-y-0.5 text-slate-100 font-medium text-lg shadow-sm transition-all math-font border-b-2 border-slate-900 active:border-b-0"
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <Button 
        onClick={handleSubmit} 
        isLoading={isLoading} 
        className="w-full text-lg font-semibold tracking-wide shadow-xl shadow-indigo-500/20"
        disabled={(!hasContent && !selectedImage)}
      >
        CALCULAR
      </Button>
    </div>
  );
};