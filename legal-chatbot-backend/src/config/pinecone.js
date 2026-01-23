import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const indexName = process.env.PINECONE_INDEX_NAME || 'legal-sections';

// Get index with proper configuration
async function getIndex() {
  try {
    const index = pc.index(indexName);
    return index;
  } catch (error) {
    console.error('Failed to connect to Pinecone index:', error);
    throw error;
  }
}

export { pc, indexName, getIndex };