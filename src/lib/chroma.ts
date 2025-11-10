import { ChromaClient } from "chromadb";
const CHROMA_URL = process.env.CHROMA_SERVER_URL || "http://localhost:8000";
export const client = new ChromaClient({ path: CHROMA_URL });

export async function getCandidatesCollection() {
  return await client.getCollection({ name: "candidates" });
}

export async function getCandidateById(candidateId: string) {
  const col = await getCandidatesCollection();
  const results = await col.get({
    ids: [candidateId],
    include: ["documents", "metadatas"]
  });
  if (!results.ids?.length) return null;
  return {
    id: candidateId,
    metadata: results.metadatas?.[0],
    document: results.documents?.[0]
  };
}

