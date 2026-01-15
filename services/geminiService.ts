
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeTicketDescription(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza este problema técnico/solicitud y genera un resumen conciso de una frase y una sugerencia de categoría (Ayuda, Consulta, Error, Solicitud, Mejora).
      
      Descripción: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestedCategory: { type: Type.STRING },
            priority: { type: Type.STRING, description: "Baja, Media, Alta, Crítica" }
          },
          required: ["summary", "suggestedCategory", "priority"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}

export async function generateSmartResponse(ticketDescription: string, userQuery: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un asistente técnico de Capital Inteligente. 
      Ticket Original: "${ticketDescription}"
      Consulta del usuario: "${userQuery}"
      Genera una respuesta profesional, empática y técnica para ayudar al administrador a responder.`,
      config: {
        systemInstruction: "Se profesional y directo. Usa el tono corporativo de Capital Inteligente.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini response error:", error);
    return "Error al generar respuesta inteligente.";
  }
}
