import Groq from "groq-sdk";
import "dotenv/config";
import fs from "fs";
import path from "path";

/**
 * Groq Service - High-speed, high-quality, FREE AI Brain integrated with Skills.
 */
export class GroqService {
  private groq: Groq;
  private model: string;
  private skills: string = "";

  constructor() {
    const apiKey = process.env.GROQ_API_KEY || "";
    this.groq = new Groq({ apiKey });
    // Using Llama-3 70B for expert DeFi research reasoning
    this.model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    this.loadSkills();
  }

  /**
   * Load skills from local file to provide context for the AI.
   */
  private loadSkills() {
    try {
      const skillPath = path.join(process.cwd(), "StrategySkill.md");
      if (fs.existsSync(skillPath)) {
        this.skills = fs.readFileSync(skillPath, "utf-8");
        console.log("📜 [AI Service] Strategic Skills loaded from StrategySkill.md (GROQ Active)");
      }
    } catch (e) {
      console.warn("⚠️  Failed to load skills:", e);
    }
  }

  /**
   * Generate a response using Groq.
   */
  async generate(prompt: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in .env");
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a Privacy-First DeFi Research AI Agent. \n\nYOUR STRATEGY SKILLS:\n${this.skills}`
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.model,
      });

      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error: any) {
      throw new Error(`Groq API Error: ${error.message}`);
    }
  }

  /**
   * Specialized method to get JSON from Groq.
   */
  async generateJSON(prompt: string): Promise<any> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a DeFi Research AI. ALWAYS respond strictly with valid JSON. Do not include markdown code blocks. \n\nYOUR SKILLS:\n${this.skills}`
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.model,
        response_format: { type: "json_object" }
      });

      const text = chatCompletion.choices[0]?.message?.content || "{}";
      return JSON.parse(text);
    } catch (e: any) {
      console.error("Failed to parse GROQ JSON:", e.message);
      throw new Error(`GROQ returned invalid JSON: ${e.message}`);
    }
  }
}
