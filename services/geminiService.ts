
import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import { ChatMessage } from "../types";

// Ensure window.ENV is defined and has the necessary properties
const env = (window as any).ENV || {};
const apiKeyFromEnv = env.API_KEY;

if (!apiKeyFromEnv || apiKeyFromEnv === "MISSING_API_KEY_PLACEHOLDER") {
  console.error(
    "API_KEY is not defined in window.ENV or is using a placeholder. " +
    "Ensure env-config.js is loaded and API_KEY is configured in your deployment environment. Gemini API calls will fail."
  );
  console.warn(
    "SECURITY WARNING: The Gemini API Key is configured for client-side access. " +
    "This is a security risk for production applications. " +
    "Consider implementing a backend proxy for API calls."
  );
}

const ai = new GoogleGenAI({ apiKey: apiKeyFromEnv || "MISSING_API_KEY_RUNTIME" }); 

const modelName = 'gemini-2.5-flash-preview-04-17';

// Helper function to map our ChatMessage[] to Gemini's Content[]
const mapMessagesToGeminiContent = (messages: ChatMessage[]): Content[] => {
  return messages.map(message => ({
    role: message.sender === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));
};

export const getResponse = async (
  prompt: string,
  systemInstruction: string,
  history: ChatMessage[] = [] 
): Promise<string> => {
  if (!apiKeyFromEnv || apiKeyFromEnv === "MISSING_API_KEY_PLACEHOLDER" || apiKeyFromEnv === "MISSING_API_KEY_RUNTIME") {
    return "API Key is not configured. Please set the API_KEY in your deployment environment.";
  }

  const geminiHistory = mapMessagesToGeminiContent(history);
  const currentPromptContent: Content = { role: 'user', parts: [{ text: prompt }] };
  const fullContents: Content[] = [...geminiHistory, currentPromptContent];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: fullContents, 
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    const text = response.text;
    if (text === null || text === undefined) {
        console.error("Gemini API returned null or undefined text.", response);
        return "I'm sorry, I couldn't generate a response at this moment.";
    }
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        if (error.message.includes("API_KEY_INVALID") || error.message.includes("API key not valid") || error.message.includes("permission") ) {
             return "There's an issue with the API configuration or permissions. Please check the API key and its restrictions. (API Key Invalid/Forbidden)";
        }
        return `An error occurred while fetching the response: ${error.message}`;
    }
    return 'An unexpected error occurred while fetching the response.';
  }
};