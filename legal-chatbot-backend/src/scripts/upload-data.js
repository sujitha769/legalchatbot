import { QdrantClient } from "@qdrant/js-client-rest";
import { pipeline } from "@huggingface/transformers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION_NAME || "legal-sections";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

let embeddingModel = null;

// ==========================================
// CREATE EMBEDDING
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
// UPLOAD LEGAL DATA
// ==========================================

async function uploadLegalData() {
  try {
    console.log("Starting upload to Qdrant...");
    console.log("Collection:", COLLECTION_NAME);

    // ==========================================
    // STEP 1: CHECK QDRANT
    // ==========================================

    console.log("Testing Qdrant connection...");

    const collections = await qdrant.getCollections();

    const collectionExists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      console.log(
        `Collection "${COLLECTION_NAME}" not found. Creating it...`
      );

      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384,
          distance: "Cosine",
        },
      });

      console.log("✓ Qdrant collection created");
    } else {
      console.log("✓ Qdrant collection already exists");
    }

    // ==========================================
    // STEP 2: READ LEGAL DATA
    // ==========================================

    const dataPath = path.join(
      __dirname,
      "../data/legal-sections.json"
    );

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const legalData = JSON.parse(rawData);

    console.log(
      `IPC sections: ${legalData.ipc_sections.length}`
    );

    console.log(
      `BNS sections: ${legalData.bns_sections.length}`
    );

    // ==========================================
    // STEP 3: CREATE EMBEDDINGS
    // ==========================================

    const points = [];

    console.log("\nProcessing IPC sections...");

    for (const section of legalData.ipc_sections) {
      const text = `
IPC Section ${section.section}: ${section.title}.
${section.description}.
Keywords: ${section.keywords.join(", ")}
`;

      const embedding = await createEmbedding(text);

      points.push({
        id: `ipc-${section.section}`,
        vector: embedding,
        payload: {
          type: "IPC",
          section: section.section,
          title: section.title,
          description: section.description,
          punishment: section.punishment,
          keywords: section.keywords.join(", "),
        },
      });

      console.log(
        `✓ Processed IPC Section ${section.section}`
      );
    }

    console.log("\nProcessing BNS sections...");

    for (const section of legalData.bns_sections) {
      const text = `
BNS Section ${section.section}: ${section.title}.
${section.description}.
Keywords: ${section.keywords.join(", ")}
`;

      const embedding = await createEmbedding(text);

      points.push({
        id: `bns-${section.section}`,
        vector: embedding,
        payload: {
          type: "BNS",
          section: section.section,
          title: section.title,
          description: section.description,
          punishment: section.punishment,
          keywords: section.keywords.join(", "),
        },
      });

      console.log(
        `✓ Processed BNS Section ${section.section}`
      );
    }

    // ==========================================
    // STEP 4: UPLOAD TO QDRANT
    // ==========================================

    console.log("\nUploading vectors to Qdrant...");
    console.log(`Total vectors: ${points.length}`);

    const batchSize = 50;
    let successCount = 0;

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);

      const batchNumber =
        Math.floor(i / batchSize) + 1;

      console.log(
        `Uploading batch ${batchNumber} (${batch.length} vectors)...`
      );

      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: batch,
      });

      successCount += batch.length;

      console.log(
        `✓ Batch ${batchNumber} uploaded successfully`
      );
    }

    // ==========================================
    // STEP 5: VERIFY
    // ==========================================

    console.log("\nVerifying Qdrant collection...");

    const collectionInfo =
      await qdrant.getCollection(COLLECTION_NAME);

    console.log(
      "Vectors stored:",
      collectionInfo.points_count
    );

    console.log("\n✅ Upload completed!");
    console.log(
      `Successfully uploaded: ${successCount}/${points.length} vectors`
    );

  } catch (error) {
    console.error("❌ Upload failed:", error.message);

    if (error.cause) {
      console.error("Cause:", error.cause);
    }

    throw error;
  }
}

uploadLegalData();
