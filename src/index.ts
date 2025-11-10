import express from "express";
import { router as searchAgentic } from "./routes/searchAgentic.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(searchAgentic);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`[server] 🚀 running at http://localhost:${port}`));
