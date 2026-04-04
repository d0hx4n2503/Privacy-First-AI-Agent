import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

/**
 * Gemini AI Service - Provides real LLM reasoning when 0G Compute is offline.
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Generate a response using Gemini.
   */
  async generate(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in .env");
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Specialized method to get JSON from Gemini.
   */
  async generateJSON(prompt: string): Promise<any> {
    const fullPrompt = `${prompt}\n\nRespond strictly with valid JSON. No markdown backticks.`;
    const text = await this.generate(fullPrompt);
    
    try {
      // Clean up markdown if AI includes it
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", text);
      throw new Error("Gemini returned invalid JSON");
    }
  }
}
