import Groq from "groq-sdk";
import { pipeline } from "@huggingface/transformers";
import { qdrant, collectionName } from "../config/qdrant.js";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let embeddingModel = null;

// ==========================================
// CREATE EMBEDDING LOCALLY
// ==========================================

async function createEmbedding(text) {
  if (!embeddingModel) {
    console.log("Loading embedding model...");

    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded");
  }

  const output = await embeddingModel(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

// ==========================================
// LEGAL ANSWER WITH RAG
// ==========================================

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
      `Embedding created: ${queryEmbedding.length} dimensions`
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
      return "No applicable legal sections found in the database for the described crime.";
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
    // STEP 5: CREATE GROQ PROMPT
    // ==========================================

    const prompt = `
You are a legal information assistant for Indian law.

Use ONLY the information provided below.

${context}

Crime description:
"${crimeText}"

Format the answer as:

INDIAN PENAL CODE (IPC)

Section: [section number]
Title: [section title]
Punishment: [punishment]

BHARATIYA NYAYA SANHITA (BNS)

Section: [section number]
Title: [section title]
Punishment: [punishment]

Rules:
- Use only the provided database information.
- Do not invent legal sections.
- Do not invent punishments.
- Copy punishment exactly from the database.
- If no IPC section applies, skip IPC.
- If no BNS section applies, skip BNS.
`;

    // ==========================================
    // STEP 6: GROQ AI
    // ==========================================

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a precise legal information assistant. Use only the information provided by the user.",
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

    console.log("Generated response with Groq");

    return text;

  } catch (error) {
    console.error("RAG Service Error:", error);

    throw new Error(
      "Failed to get legal answer: " + error.message
    );
  }
}
