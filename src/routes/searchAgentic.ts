import express from "express";
import { candidateAgent } from "../agents/candidateAgent.js";
import { ComplianceGuard } from "../middleware/complianceGuard.js";
import { logAudit } from "../utils/auditLogger.js";
import { v4 as uuidv4 } from "uuid";
import { resolveMaskedIds } from "../utils/idMapper.js";
import { getCandidateById } from "../lib/chroma.js";

export const router = express.Router();

router.post("/search-agentic", async (req, res) => {
  const { query } = req.body;
  const auditId = uuidv4();

  try {
    // 1️⃣ Orchestrate via Mastra agent
    const response = await candidateAgent.generateVNext([{ role: "user", content: query }]);
    const rawText = response.text ?? "{}";

    // 2️⃣ Ensure LLM output is PII-safe
    const safeOutput = ComplianceGuard.validateAfterLLM(rawText);

    // 3️⃣ Parse AI output
    const parsed = JSON.parse(safeOutput);
    const allMaskedIds = [
      ...(parsed?.exact || []).map((c: any) => c.maskedId),
      ...(parsed?.similar || []).map((c: any) => c.maskedId),
    ];

    // 4️⃣ Resolve to real IDs
    const realIds = resolveMaskedIds(allMaskedIds);

    // 5️⃣ Retrieve actual candidate data
    const candidates = await Promise.all(realIds.map(id => getCandidateById(id)));
    const candidateMap = Object.fromEntries(
      candidates.filter(Boolean).map(c => [c?.id, c])
    );

    // 6️⃣ Replace masked IDs with real data
    const hydrate = (arr: any[]) =>
      arr
        .map((c: any) => {
          const real = candidateMap[resolveMaskedIds([c.maskedId])[0]];
          return real
            ? {
                id: real.id,
                name: real.metadata?.name,
                skills: real.metadata?.skills,
                location: real.metadata?.location,
                experience: real.metadata?.experience,
                summary: c.summary || real.document?.slice(0, 200),
              }
            : null;
        })
        .filter(Boolean);

    const finalResponse = {
      exact: hydrate(parsed?.exact || []),
      similar: hydrate(parsed?.similar || []),
    };

    // 7️⃣ Log and respond
    logAudit({ auditId, query, maskedIds: allMaskedIds, returnedIds: realIds });
    res.json({ auditId, result: finalResponse });
  } catch (err: any) {
    console.error("[search-agentic] error:", err);
    logAudit({ auditId, query, error: err.message });
    res.status(500).json({ auditId, error: "Internal Server Error" });
  }
});
