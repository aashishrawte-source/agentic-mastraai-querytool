import { createTool } from "@mastra/core/tools";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const sentimentTool = createTool({
    id: "sentiment-analyzer",
    description: "Analyze masked candidate feedback sentiment.",
    inputSchema: z.object({
        feedback: z.array(z.string()).min(1),
    }),
    outputSchema: z.array(
        z.object({
            snippet: z.string(),
            sentiment: z.enum(["positive", "neutral", "negative"]),
            confidence: z.number().min(0).max(1),
        })
    ),
    execute: async (args: any) => {
        const { feedback } = args.context;
        const prompt = `Rate sentiment (positive/neutral/negative) of each masked feedback JSON:
${JSON.stringify(feedback, null, 2)}`;

        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });

        try {
            return JSON.parse(res.choices[0].message?.content ?? "[]");
        } catch {
            interface SentimentResult {
                snippet: string;
                sentiment: "positive" | "neutral" | "negative";
                confidence: number;
            }

            return feedback.map((f: string): SentimentResult => ({
                snippet: f,
                sentiment: "neutral",
                confidence: 0.5
            }));
        }
    },
});
