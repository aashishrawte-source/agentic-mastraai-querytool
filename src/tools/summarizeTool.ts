import { createTool } from "@mastra/core/tools";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeTool = createTool({
  id: "summarizer",
  description: "Summarize masked candidate snippets safely.",
  inputSchema: z.object({ docs: z.array(z.string()) }),
  outputSchema: z.string(),
  execute: async (args: any) => {
    const text = args.context.docs.join("\n\n");
    const prompt = `Summarize the following candidate data (no PII, concise and professional):\n${text}`;
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message?.content ?? "";
  },
});
