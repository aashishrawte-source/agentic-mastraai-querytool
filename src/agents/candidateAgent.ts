import { Agent } from "@mastra/core";
import { openai as aiFactory } from "@ai-sdk/openai";
import { queryChromaTool } from "../tools/queryChromaTool.js";
import { summarizeTool } from "../tools/summarizeTool.js";
import { sentimentTool } from "../tools/sentimentTool.js";
import { rerankTool } from "../tools/rerankTool.js";

export const candidateAgent = new Agent({
  name: "Candidate Intelligence Agent",
  instructions: `
You are a compliance-safe candidate intelligence system.
Use available tools to retrieve, summarize, analyze sentiment, and rerank candidates.
Never output or infer personal identifiers.`,
  model: aiFactory("gpt-4o-mini"),
  tools: { queryChromaTool, summarizeTool, sentimentTool, rerankTool },
});
