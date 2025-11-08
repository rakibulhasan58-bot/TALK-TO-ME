
import { GoogleGenAI } from "@google/genai";
import { type Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateReply = async (prompt: string, contactName: string, history: Message[]): Promise<string> => {
  try {
    const chatHistory = history
      .slice(-10) // Get last 10 messages for context
      .map(msg => `${msg.author === 0 ? 'User' : contactName}: ${msg.text}`)
      .join('\n');
    
    const fullPrompt = `
      You are ${contactName}, having a casual conversation with a friend.
      Here is the recent chat history:
      ${chatHistory}
      
      Your friend just said: "${prompt}"
      
      Based on this, what is your reply? Keep it conversational, friendly, and relatively short, like a real text message. Do not use your name in the response.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    if (response && response.text) {
      return response.text;
    } else {
      throw new Error("Invalid response from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
