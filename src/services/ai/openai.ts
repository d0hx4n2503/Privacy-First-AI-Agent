import OpenAI from "openai";
import "dotenv/config";
import fs from "fs";
import path from "path";

/**
 * OpenAI Service - Provides high-quality LLM reasoning with Skill integration.
 */
export class OpenAIService {
  private openai: OpenAI;
  private model: string;
  private skills: string = "";

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || "";
    this.openai = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
    this.loadSkills();
  }

  /**
   * Load skills from local file to provide context for the AI.
   */
  private loadSkills() {
    try {
      const skillPath = path.join(process.cwd(), "skill.md");
      if (fs.existsSync(skillPath)) {
        this.skills = fs.readFileSync(skillPath, "utf-8");
        console.log("📜 [AI Service] Skills loaded from skill.md");
      }
    } catch (e) {
      console.warn("⚠️  Failed to load skills:", e);
    }
  }

  /**
   * Generate a response using OpenAI.
   */
  async generate(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in .env");
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: "system", 
            content: `You are a Privacy-First DeFi AI Agent. \n\nCORE SKILLS AND RULES:\n${this.skills}` 
          },
          { role: "user", content: prompt }
        ],
      });

      return completion.choices[0].message.content || "";
    } catch (error: any) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }

  /**
   * Specialized method to get JSON from OpenAI.
   */
  async generateJSON(prompt: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: "system", 
            content: `You are a DeFi Analysis AI. Respond ONLY with valid JSON. \n\nCORE SKILLS:\n${this.skills}` 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const text = completion.choices[0].message.content || "{}";
      return JSON.parse(text);
    } catch (e: any) {
      console.error("Failed to parse OpenAI JSON:", e.message);
      throw new Error("OpenAI returned invalid JSON");
    }
  }
}
