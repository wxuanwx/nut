
import { GoogleGenAI } from "@google/genai";

/**
 * 企业级 AI 服务封装
 * 统一处理配置、模型选择和错误监控
 */
export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 基础文本生成任务
   */
  async generateContent(prompt: string, isComplex = false) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = isComplex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("[AIService Error]:", error);
      throw new Error("AI 服务暂时不可用，请稍后再试。");
    }
  }

  /**
   * 结构化 JSON 生成任务
   */
  async generateJSON(prompt: string, schema: any) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("[AIService JSON Error]:", error);
      return null;
    }
  }
}

export const aiService = AIService.getInstance();
