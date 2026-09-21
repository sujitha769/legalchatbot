import Groq from "groq-sdk";
import { pipeline } from "@xenova/transformers";
import { pc, indexName } from "../config/pinecone.js";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let embeddingModel = null;

// Load local embedding model only once
async function getEmbeddingModel() {
  if (!embeddingModel) {
    console.log("Loading embedding model...");

    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded");
  }

  return embeddingModel;
}

// Create embedding locally
async function createEmbedding(text) {
  const model = await getEmbeddingModel();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

export async function getLegalAnswerWithRAG(crimeText) {
  try {
    console.log(
      `Processing query: ${crimeText.substring(0, 50)}...`
    );

    // ==========================================
    // STEP 1: CREATE QUERY EMBEDDING
    // ==========================================

    const queryEmbedding = await createEmbedding(crimeText);

    console.log(
      `Created embedding with ${queryEmbedding.length} dimensions`
    );

    // ==========================================
    // STEP 2: SEARCH PINECONE
    // ==========================================

    const index = pc.index(indexName);

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 6,
      includeMetadata: true,
    });

    console.log(
      `Found ${searchResults.matches.length} relevant sections`
    );

    // ==========================================
    // STEP 3: GET RELEVANT LEGAL SECTIONS
    // ==========================================

    const relevantSections = searchResults.matches
      .filter((match) => match.score > 0.5)
      .map((match) => match.metadata);

    if (relevantSections.length === 0) {
      return "No applicable legal sections found in the database for the described crime. Please provide more details or rephrase your description.";
    }

    // ==========================================
    // STEP 4: BUILD CONTEXT
    // ==========================================

    let context =
      "RELEVANT LEGAL SECTIONS FROM DATABASE:\n\n";

    const ipcSections = relevantSections.filter(
      (section) => section.type === "IPC"
    );

    const bnsSections = relevantSections.filter(
      (section) => section.type === "BNS"
    );

    if (ipcSections.length > 0) {
      context += "INDIAN PENAL CODE (IPC):\n";

      ipcSections.forEach((section) => {
        context += `Section ${section.section}: ${section.title}\n`;
        context += `Description: ${section.description}\n`;
        context += `Punishment: ${section.punishment}\n\n`;
      });
    }

    if (bnsSections.length > 0) {
      context += "BHARATIYA NYAYA SANHITA (BNS):\n";

      bnsSections.forEach((section) => {
        context += `Section ${section.section}: ${section.title}\n`;
        context += `Description: ${section.description}\n`;
        context += `Punishment: ${section.punishment}\n\n`;
      });
    }

    // ==========================================
    // STEP 5: CREATE RAG PROMPT
    // ==========================================

    const prompt = `
You are a legal information assistant for Indian law.

Use ONLY the information provided in the database context below.

${context}

Crime description:
"${crimeText}"

Based ONLY on the legal sections provided above, format your response as follows:

INDIAN PENAL CODE (IPC)

Section: [section number]
Title: [section title]
Punishment: [punishment details from database]

BHARATIYA NYAYA SANHITA (BNS)

Section: [section number]
Title: [section title]
Punishment: [punishment details from database]

CRITICAL RULES:

- Use ONLY the sections provided in the context.
- Do NOT invent legal sections.
- Do NOT invent punishment.
- Copy punishment details exactly as provided in the database.
- If multiple sections apply, list all of them.
- If no IPC section applies, skip the IPC section.
- If no BNS section applies, skip the BNS section.
- Do not add information that is not present in the database.
`;

    // ==========================================
    // STEP 6: GROQ
    // ==========================================

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a precise legal information assistant. Follow the provided database context strictly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    });

    const text =
      completion.choices[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("Groq returned an empty response");
    }

    console.log("Generated response with Groq + RAG");

    return text;

  } catch (error) {
    console.error("RAG Service Error:", error);

    throw new Error(
      "Failed to get legal answer: " + error.message
    );
  }
}
