import { createTool } from "@mastra/core/tools";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const rerankTool = createTool({
  id: "rerank",
  description: "Classify retrieved candidates into exact and similar matches.",
  inputSchema: z.object({
    query: z.string(),
    candidates: z.array(z.any()),
  }),
  outputSchema: z.object({
    exact: z.array(z.any()),
    similar: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const { query, candidates } = args.context;
    const prompt = `
Query: "${query}"
Candidates: ${JSON.stringify(candidates)}
Group them into:
{ exact: [ids], similar: [ids] }`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    try {
      return JSON.parse(resp.choices[0].message?.content ?? "{}");
    } catch {
      return { exact: [], similar: [] };
    }
  },
});
