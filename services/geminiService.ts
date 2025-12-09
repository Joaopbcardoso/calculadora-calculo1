
import { GoogleGenAI } from "@google/genai";
import { CalcMode, ChatMessage } from "../types";

// Initialize the client
// IMPORTANT: The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Solves a math problem using Gemini 2.5 Flash for speed and multimodal capabilities.
 */
export const solveMathProblem = async (
  text: string,
  mode: CalcMode,
  imageBase64?: string
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Excellent for speed and multimodal math OCR

    const parts: any[] = [];

    // If an image is provided, add it to the parts
    if (imageBase64) {
      // Parse the data URL to get mimeType and base64 data
      // Format is usually: data:image/png;base64,iVBORw...
      const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
      
      let mimeType = "image/jpeg"; // Default fallback
      let data = imageBase64;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        data = matches[2];
      } else {
        // Simple fallback if regex fails but comma exists
        const split = imageBase64.split(',');
        if (split.length > 1) {
          data = split[1];
        }
      }
      
      parts.push({
        inlineData: {
          mimeType,
          data,
        },
      });
    }

    // Construct the prompt
    let prompt = `Você é um professor especialista em Cálculo 1.
    O usuário quer resolver um problema de **${mode}**.
    
    Instruções:
    1. Se houver uma imagem, identifique a equação matemática na imagem.
    2. Se houver texto, use-o para complementar ou definir a equação.
    3. Resolva o problema passo a passo.
    4. Explique cada regra utilizada (ex: Regra da Cadeia, L'Hôpital, Integração por Partes).
    
    IMPORTANTE SOBRE FORMATAÇÃO (LaTeX):
    - Utilize estritamente sintaxe LaTeX para todas as expressões matemáticas.
    - Para expressões matemáticas destacadas (bloco centralizado), use DOIS cifrões:
      $$ \\int_{0}^{\\infty} x^2 dx $$
    - Para expressões matemáticas na mesma linha do texto (inline), use UM cifrão:
      O valor de $x$ é 10.
    - Não use blocos de código markdown (como \`\`\`) para a matemática, use apenas o LaTeX com $.
    - Utilize títulos Markdown (##, ###) para separar os passos (Ex: ## Passo 1: Identificação).
    - O idioma deve ser Português do Brasil.
    - Seja muito visual e organizado.
    `;

    if (text) {
      prompt += `\n\nTexto/Equação fornecida pelo usuário: ${text}`;
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        temperature: 0.2, // Low temperature for precise math
      }
    });

    return response.text || "Não foi possível gerar uma solução.";
  } catch (error) {
    console.error("Error solving math problem:", error);
    return "Desculpe, ocorreu um erro ao tentar resolver o problema. Verifique sua conexão ou tente novamente.";
  }
};

/**
 * Answers follow-up questions about the solution.
 */
export const solveFollowUpQuestion = async (
  originalProblem: string,
  originalSolution: string,
  history: ChatMessage[],
  question: string
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash";

    let context = `Contexto do Problema Original:\n${originalProblem}\n\nSolução Apresentada:\n${originalSolution}\n\n`;

    // Append recent history to context string (simple concatenation for Flash context window)
    if (history.length > 0) {
      context += "Histórico da Conversa:\n";
      history.forEach(msg => {
        context += `${msg.role === 'user' ? 'Aluno' : 'Professor'}: ${msg.content}\n`;
      });
    }

    const prompt = `
    Você é um professor de cálculo paciente e didático.
    O aluno tem uma dúvida sobre a solução apresentada acima.
    
    Instruções:
    1. Responda especificamente à dúvida do aluno: "${question}"
    2. Use o contexto da solução original para explicar "por que" algo foi feito.
    3. Use LaTeX para toda a matemática ($...$ ou $$...$$).
    4. Seja breve mas esclarecedor.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: context + "\n\n" + prompt }
        ]
      }
    });

    return response.text || "Não entendi sua dúvida, pode reformular?";

  } catch (error) {
    console.error("Error answering follow-up:", error);
    return "Erro ao processar sua dúvida.";
  }
};
