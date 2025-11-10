import { createTool } from "@mastra/core/tools";
import { getCandidatesCollection } from "../lib/chroma.js";
import OpenAI from "openai";
import crypto from "crypto";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const maskId = (id: string) => "cand_" + crypto.createHash("sha1").update(id).digest("hex").slice(0, 8);

export const queryChromaTool = createTool({
  id: "query-chroma",
  description: "Retrieve candidates from ChromaDB semantically.",
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.array(
    z.object({
      maskedId: z.string(),
      snippet: z.string(),
      score: z.number().optional(),
      metadata: z.record(z.string()),
    })
  ),
  execute: async (args: any) => {
    const query = args.context.query;
    const emb = await openai.embeddings.create({ model: "text-embedding-3-large", input: query });
    const embedding = emb.data[0].embedding;
    const col = await getCandidatesCollection();

    const results = await col.query({
      queryEmbeddings: [embedding],
      nResults: 10,
      include: ["documents", "metadatas", "distances"],
    });

    const docs = results.documents?.[0] || [];
    const metas = results.metadatas?.[0] || [];
    const dists = results.distances?.[0] || [];

    return docs.map((doc: string | null, i: number) => ({
      maskedId: maskId(String(metas[i]?.id ?? i)),
      snippet: (doc ?? "").slice(0, 400),
      score: dists[i] ?? undefined,
      metadata: Object.fromEntries(Object.entries(metas[i] || {}).map(([key, value]) => [key, String(value)])),
    }));
  },
});
