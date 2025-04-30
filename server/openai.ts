// import OpenAI from "openai";

// // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });

// export interface OptimizedPromptResult {
//   optimizedPrompt: string;
//   reasoning: string;
//   improvements: string[];
// }

// export async function optimizePrompt(
//   originalPrompt: string,
//   audience: string = "general",
//   focusAreas: string[] = ["specificity", "clarity"]
// ): Promise<OptimizedPromptResult> {
//   try {
//     const focusAreasText = focusAreas.join(", ");
    
//     // Create a more precise and streamlined system prompt for faster generation
//     const systemPrompt = `You are an AI prompt optimization expert tasked with improving user prompts for better results from language models. 
// Make the prompt more effective based on these requirements:

// TARGET AUDIENCE: ${audience}
// OPTIMIZATION FOCUS: ${focusAreasText}

// OPTIMIZATION RULES:
// ${focusAreas.includes("specificity") ? "- Add specific details, examples, and parameters where helpful" : ""}
// ${focusAreas.includes("clarity") ? "- Improve structure, eliminate ambiguity, and use clear language" : ""}
// ${focusAreas.includes("ctas") ? "- Add clear calls-to-action for specific outputs/formats" : ""}
// ${audience !== "general" ? `- Adapt language and terminology for ${audience} audience` : ""}

// Your improvements should be purposeful, precise, and meaningfully enhance how AI models understand and respond.

// IMPORTANT: Preserve the original intent completely. Don't add unrelated functionality or change the core purpose.
// Keep the optimized prompt concise - don't make it unnecessarily verbose.
// `;

//     // Use temperature 0.3 for more consistent and precise results
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
//       messages: [
//         {
//           role: "system",
//           content: systemPrompt,
//         },
//         {
//           role: "user",
//           content: originalPrompt,
//         },
//       ],
//       response_format: { type: "json_object" },
//       temperature: 0.3, // Lower temperature for more precise and predictable results
//       max_tokens: 1500, // Limit token usage for faster response
//     });

//     // Parse the response with better error handling
//     let result: OptimizedPromptResult;
    
//     try {
//       const content = response.choices[0].message.content || '{}';
//       result = JSON.parse(content) as OptimizedPromptResult;
      
//       // Validate that the result has the expected structure
//       if (!result.optimizedPrompt) {
//         throw new Error("Missing optimizedPrompt in response");
//       }
      
//       // Ensure we have an array of improvements (even if empty)
//       if (!result.improvements || !Array.isArray(result.improvements)) {
//         result.improvements = [];
//       }
      
//       // Ensure reasoning exists
//       if (!result.reasoning) {
//         result.reasoning = "Prompt optimized for better AI understanding and response";
//       }
//     } catch (parseError) {
//       console.error("Error parsing OpenAI response:", parseError);
//       // Provide a fallback structure if parsing fails
//       result = {
//         optimizedPrompt: originalPrompt,
//         reasoning: "There was an error optimizing your prompt. The original prompt has been returned.",
//         improvements: ["Could not generate improvements at this time"]
//       };
//     }
    
//     return {
//       optimizedPrompt: result.optimizedPrompt,
//       reasoning: result.reasoning,
//       improvements: result.improvements
//     };
//   } catch (error) {
//     console.error("Error optimizing prompt:", error);
//     throw new Error("Failed to optimize prompt. Please try again later.");
//   }
// }
import OpenAI from "openai";

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

    // Optional: log unsupported focus areas
    const validFocusAreas = ["specificity", "clarity", "ctas", "engagement"];
    const unsupported = focusAreas.filter(f => !validFocusAreas.includes(f));
    if (unsupported.length > 0) {
      console.warn("⚠️ Unsupported focus areas provided:", unsupported);
    }

    // Build system prompt
    const systemPrompt = `You are an AI prompt optimization expert tasked with improving user prompts for better results from language models. 
Make the prompt more effective based on these requirements:

TARGET AUDIENCE: ${audience}
OPTIMIZATION FOCUS: ${focusAreasText}

OPTIMIZATION RULES:
${focusAreas.includes("specificity") ? "- Add specific details, examples, and parameters where helpful" : ""}
${focusAreas.includes("clarity") ? "- Improve structure, eliminate ambiguity, and use clear language" : ""}
${focusAreas.includes("ctas") ? "- Add clear calls-to-action for specific outputs/formats" : ""}
${focusAreas.includes("engagement") ? "- Make the prompt more emotionally engaging or attention-grabbing" : ""}
${audience !== "general" ? `- Adapt language and terminology for ${audience} audience` : ""}

Your improvements should be purposeful, precise, and meaningfully enhance how AI models understand and respond.

IMPORTANT: Preserve the original intent completely. Don't add unrelated functionality or change the core purpose.
Keep the optimized prompt concise - don't make it unnecessarily verbose.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: originalPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500
    });

    let result: OptimizedPromptResult;
    try {
      const content = response.choices[0].message.content || '{}';
      result = JSON.parse(content) as OptimizedPromptResult;

      if (!result.optimizedPrompt) {
        throw new Error("Missing optimizedPrompt in response");
      }

      if (!Array.isArray(result.improvements)) {
        result.improvements = [];
      }

      if (!result.reasoning) {
        result.reasoning = "Prompt optimized for better AI understanding and response";
      }

    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      result = {
        optimizedPrompt: originalPrompt,
        reasoning: "There was an error optimizing your prompt. The original prompt has been returned.",
        improvements: ["Could not generate improvements at this time"]
      };
    }

    return result;

  } catch (error) {
    console.error("Error optimizing prompt:", error);
    throw new Error("Failed to optimize prompt. Please try again later.");
  }
}
