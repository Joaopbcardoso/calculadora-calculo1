
export enum CalcMode {
  LIMITS = 'Limites',
  DERIVATIVES = 'Derivadas',
  INTEGRALS = 'Integrais',
}

export interface MathProblem {
  text: string;
  image?: string; // Base64
  mode: CalcMode;
}

export interface SolutionStep {
  markdown: string;
}

export interface HistoryItem extends MathProblem {
  id: string;
  solution: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
