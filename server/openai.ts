import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });

export interface OptimizedPromptResult {
  optimizedPrompt: string;
  reasoning: string;
  improvements: string[];
}

export async function optimizePrompt(
  originalPrompt: string,
  audience: string = "general",
  focusAreas: string[] = ["specificity", "clarity"]
): Promise<OptimizedPromptResult> {
  try {
    const focusAreasText = focusAreas.join(", ");
    const systemPrompt = `
      You are a prompt optimization expert. Your goal is to improve the user's prompt to make it more effective with AI systems.
      Focus on these specific areas: ${focusAreasText}.
      
      If specificity is requested, make the prompt more detailed and precise.
      If clarity is requested, improve the structure and eliminate ambiguity.
      If CTAs are requested, add clear calls to action that guide the AI.
      
      The target audience is: ${audience}.
      
      Respond with a JSON object in this format:
      {
        "optimizedPrompt": "the improved prompt text",
        "reasoning": "brief explanation of your changes",
        "improvements": ["specific improvement 1", "specific improvement 2", ...]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: originalPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content) as OptimizedPromptResult;
    
    return {
      optimizedPrompt: result.optimizedPrompt,
      reasoning: result.reasoning,
      improvements: result.improvements
    };
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    throw new Error("Failed to optimize prompt. Please try again later.");
  }
}
