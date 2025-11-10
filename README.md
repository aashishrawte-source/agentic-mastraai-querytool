# agentic-mastraai-querytool
Perfect. Below is a **complete, production-grade README.md** — written the way you’d share with your engineering team or during onboarding. It explains **what the project does**, **how the architecture works**, **how to run it**, **how to extend it**, and **how to stay compliant**.

This reads like something you’d put in a professional repo at Technogise.

---

# 🧠 Agentic-Mastra-AI

### Privacy-First Candidate Intelligence System (Teamtailor + Chroma + Mastra + OpenAI)

---

## 🚀 Overview

**Agentic-Mastra-AI** is an **agentic AI backend** built using **TypeScript, Mastra, ChromaDB, and OpenAI**, designed to help recruiters and HR teams query, analyze, and summarize candidate information — while staying **100% compliant with data privacy standards**.

It allows natural language queries such as:

> “Find backend developers with Python and fintech experience.”
> “Show me candidates with positive feedback and more than 5 years of experience.”

Behind the scenes, it uses:

* 🧩 **Mastra** – for orchestration and agent reasoning
* 🧮 **ChromaDB** – for vector storage and semantic retrieval
* 🤖 **OpenAI** – for summarization, sentiment, and reranking
* 🔐 **Compliance Guard** – ensures **no PII (Personal Identifiable Information)** is ever sent to LLMs
* 🪪 **ID Mapper** – handles mapping between real candidates and masked AI-safe identifiers
* 🧾 **Audit Logger** – tracks all AI operations for traceability and compliance

---

## 🏗️ High-Level Architecture

```
User ───> /search-agentic API ─────────────────────────────────────────────┐
│                                                                          │
│                        🧠 Mastra Orchestrator (AI Agent)                 │
│                - interprets natural language query                       │
│                - decides tools: retrieval / summarization / sentiment    │
│                                                                          ▼
│                  🔐 Compliance Guard (Pre-LLM)                           
│                  - removes all personal identifiers                      │
│                                                                          ▼
│                  📂 Retrieval (ChromaDB)                                 
│                  - fetches candidate vectors + metadata                  │
│                                                                          ▼
│                  🤖 LLM Tools Layer                                      
│                  - summarization, sentiment, filtering, reranking        │
│                                                                          ▼
│                  🔐 Compliance Guard (Post-LLM)                          
│                  - validates no PII leaked from LLM                      │
│                                                                          ▼
│                  🧩 ID Resolver + Result Mapper                          
│                  - replaces masked IDs with real candidate details       │
│                                                                          ▼
│                  🪵 Audit Logger                                         
│                  - logs everything (query, masked IDs, results)          │
│                                                                          ▼
└────────────────────────────── JSON Response ─────────────────────────────┘
```

---

## 🧩 Key Principles

| Principle                           | Description                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Data Privacy First**              | All PII (names, emails, phones, gender, etc.) are stripped before AI reasoning.                   |
| **AI Operates on Masked Data Only** | LLMs only receive anonymized snippets and vector metadata.                                        |
| **Post-AI Identity Resolution**     | Real candidate data is reattached **after** AI processing.                                        |
| **Auditability**                    | Every request is logged with audit IDs for compliance and traceability.                           |
| **Scalable Modularity**             | Each AI function (retrieval, summarization, sentiment, reranking) is its own tool under `/tools`. |

---

## 🧱 Folder Structure

```
src/
 ├── index.ts                     # Express entry point
 ├── agents/
 │    └── candidateAgent.ts       # Mastra agent orchestrator
 ├── lib/
 │    └── chroma.ts               # ChromaDB connection + retrieval utils
 ├── middleware/
 │    └── complianceGuard.ts      # PII masking & validation
 ├── routes/
 │    └── searchAgentic.ts        # /search-agentic API route
 ├── tools/
 │    ├── queryChromaTool.ts      # semantic retrieval
 │    ├── summarizeTool.ts        # LLM summarization
 │    ├── sentimentTool.ts        # sentiment analysis
 │    └── rerankTool.ts           # AI-based reranking
 └── utils/
      ├── idMapper.ts             # encrypted ID ↔ real ID mapping
      └── auditLogger.ts          # JSONL audit log writer
```

---

## ⚙️ Setup and Installation

### 1. Clone the repository

```bash
git clone https://gitlab.com/technogise/agentic-mastra-ai.git
cd agentic-mastra-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the project root:

```bash
OPENAI_API_KEY=sk-your-openai-key
CHROMA_SERVER_URL=http://localhost:8000
MAPPING_KEY=super_secret_32_byte_encryption_key
PORT=3000
```

### 4. Run ChromaDB locally

Using Docker:

```bash
docker run -d -p 8000:8000 chromadb/chroma
```

### 5. Start the dev server

If using CommonJS:

```bash
npm run dev
```

If using ESM:

```bash
ts-node-esm src/index.ts
```

---

## 🔍 Example Query

### Request

```bash
POST http://localhost:3000/search-agentic
Content-Type: application/json

{
  "query": "Find backend developers with fintech experience"
}
```

### Response

```json
{
  "auditId": "d9a2c6b1-ff10-4ef1-9e6b-0a6e69dc0014",
  "result": {
    "exact": [
      {
        "id": "101",
        "name": "John Doe",
        "skills": ["Python", "Django"],
        "location": "Pune",
        "experience": 7,
        "summary": "Backend developer, Python + Django in fintech."
      }
    ],
    "similar": [
      {
        "id": "102",
        "name": "Jane Patel",
        "skills": ["Flask", "ML"],
        "location": "Mumbai",
        "experience": 6,
        "summary": "Strong backend experience, finance adjacent projects."
      }
    ]
  }
}
```

---

## 🧠 How It Works (Step-by-Step)

| Step | Component                     | Description                                 |
| ---- | ----------------------------- | ------------------------------------------- |
| 1️⃣  | `/search-agentic`             | Receives natural language query             |
| 2️⃣  | Mastra Agent                  | Orchestrates which AI tools to use          |
| 3️⃣  | Compliance Guard (Pre)        | Redacts all personal info                   |
| 4️⃣  | QueryChromaTool               | Retrieves semantically relevant candidates  |
| 5️⃣  | SummarizeTool + SentimentTool | Generates summaries and sentiment analysis  |
| 6️⃣  | RerankTool                    | Categorizes results as “exact” or “similar” |
| 7️⃣  | Compliance Guard (Post)       | Validates LLM output has no PII             |
| 8️⃣  | ID Mapper                     | Resolves masked IDs to real candidates      |
| 9️⃣  | Audit Logger                  | Logs everything for traceability            |
| 🔟   | Express API                   | Returns final user-friendly JSON result     |

---

## 🔐 Compliance and Privacy Model

| Layer               | What It Does                                                      | AI Access           | Storage               |
| ------------------- | ----------------------------------------------------------------- | ------------------- | --------------------- |
| **ChromaDB**        | Stores all structured + unstructured data (resume text, feedback) | ❌                   | ✅                     |
| **Mastra Agent**    | Orchestrates reasoning                                            | ✅ (masked)          | ❌                     |
| **ComplianceGuard** | Masks PII pre-LLM, verifies post-LLM                              | ❌                   | ✅                     |
| **LLM (OpenAI)**    | Handles summarization, ranking, analysis                          | ✅ (redacted only)   | ❌                     |
| **ID Mapper**       | Handles real ↔ masked mapping securely                            | ❌                   | ✅ (AES-256 encrypted) |
| **Audit Logger**    | Logs operations for compliance                                    | ✅ (masked IDs only) | ✅                     |

---

## 🧾 Audit Logging

All queries and responses are logged to `logs/audit.jsonl`:

Example entry:

```json
{
  "ts": "2025-11-10T09:52:00.123Z",
  "auditId": "d9a2c6b1-ff10-4ef1-9e6b-0a6e69dc0014",
  "query": "Find backend developers with fintech experience",
  "maskedIds": ["cand_a93b21f8", "cand_0ef71a42"],
  "returnedIds": ["101", "102"]
}
```

---

## 🧩 Extending the System

| Task                          | Location                            | Notes                         |
| ----------------------------- | ----------------------------------- | ----------------------------- |
| Add a new AI Tool             | `src/tools/`                        | Follow `createTool()` pattern |
| Add compliance rules          | `src/middleware/complianceGuard.ts` | Extend regex-based redaction  |
| Modify summarization          | `src/tools/summarizeTool.ts`        | Tune LLM prompts              |
| Change vector retrieval logic | `src/tools/queryChromaTool.ts`      | Adjust embeddings or filters  |
| Add new API route             | `src/routes/`                       | Register in `src/index.ts`    |

---

## 🧰 Recommended Development Tools

* **VSCode** with TypeScript + ESLint plugins
* **ts-node-dev** for live reload
* **ChromaDB UI (optional)** for vector inspection
* **Postman** for API testing

---

## 🧩 Example Scenarios

**Example 1:**

> “Summarize top 5 fintech candidates with positive feedback”
> → Retrieves Chroma candidates → filters via LLM sentiment → returns concise summaries.

**Example 2:**

> “Find candidates similar to candidate 101”
> → Uses embedding similarity → returns “similar” block.

**Example 3:**

> “Summarize common feedback trends for backend roles”
> → SentimentTool + SummarizeTool combined pipeline.

---

## ⚠️ Important Notes

* Never log or send PII to LLM APIs.
* Use the **masked ID only** for AI interactions.
* Keep the `MAPPING_KEY` secret — it encrypts your local ID mapping file.
* Always check `audit.jsonl` before releasing any production insights.

---

## 📦 Build and Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```
---

## 🧭 Roadmap

| Phase      | Focus                              |
| ---------- | ---------------------------------- |
| ✅ Phase 1  | Chroma Integration + Data Masking  |
| ✅ Phase 2  | Mastra Agent + LLM Orchestration   |
| ✅ Phase 3  | Summarization + Sentiment Analysis |
| ✅ Phase 4  | Exact/Similar Result Mapping       |
| 🔜 Phase 5 | Multi-agent Collaboration          |

---

## 👥 Contributors

| Name                   | Role                       |
| ---------------------- | -------------------------- |
| **Aashish**            | Core Developer & Architect |
| **Mastra + OpenAI**    | AI Stack Providers         |

---
