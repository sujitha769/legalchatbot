import { GoogleGenerativeAI } from '@google/generative-ai';
import { pc, indexName } from '../config/pinecone.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function uploadLegalData() {
  try {
    console.log('Starting upload to Pinecone...');
    console.log('Index name:', indexName);
    
    // Verify Pinecone connection first
    console.log('Testing Pinecone connection...');
    const indexes = await pc.listIndexes();
    console.log('Available indexes:', indexes.indexes?.map(i => i.name));
    
    // Check if our index exists
    const indexExists = indexes.indexes?.some(i => i.name === indexName);
    if (!indexExists) {
      console.error(`❌ Index "${indexName}" not found!`);
      console.log('Please create the index in Pinecone dashboard with:');
      console.log('- Name: legal-sections');
      console.log('- Dimension: 768');
      console.log('- Metric: cosine');
      return;
    }
    
    console.log('✓ Index found');
    
    // Read legal data
    const dataPath = path.join(__dirname, '../data/legal-sections.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const legalData = JSON.parse(rawData);
    
    // Get index
    const index = pc.index(indexName);
    
    // Wait a bit for index to be fully ready
    console.log('Waiting for index to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const vectors = [];
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    // Process IPC sections
    console.log('Processing IPC sections...');
    for (const section of legalData.ipc_sections) {
      const text = `IPC Section ${section.section}: ${section.title}. ${section.description}. Keywords: ${section.keywords.join(', ')}`;
      
      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding.values;
      
      vectors.push({
        id: `ipc-${section.section}`,
        values: embedding,
        metadata: {
          type: 'IPC',
          section: section.section,
          title: section.title,
          description: section.description,
          punishment: section.punishment,
          keywords: section.keywords.join(', ')
        }
      });
      
      console.log(`✓ Processed IPC Section ${section.section}`);
    }
    
    // Process BNS sections
    console.log('Processing BNS sections...');
    for (const section of legalData.bns_sections) {
      const text = `BNS Section ${section.section}: ${section.title}. ${section.description}. Keywords: ${section.keywords.join(', ')}`;
      
      const result = await embeddingModel.embedContent(text);
      const embedding = result.embedding.values;
      
      vectors.push({
        id: `bns-${section.section}`,
        values: embedding,
        metadata: {
          type: 'BNS',
          section: section.section,
          title: section.title,
          description: section.description,
          punishment: section.punishment,
          keywords: section.keywords.join(', ')
        }
      });
      
      console.log(`✓ Processed BNS Section ${section.section}`);
    }
    
    // Upload to Pinecone with retry logic
    console.log('Uploading to Pinecone...');
    console.log(`Total vectors to upload: ${vectors.length}`);
    
    const batchSize = 10; // Smaller batch size for better reliability
    let successCount = 0;
    
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      try {
        console.log(`Uploading batch ${batchNum} (${batch.length} vectors)...`);
        await index.upsert(batch);
        successCount += batch.length;
        console.log(`✓ Batch ${batchNum} uploaded successfully`);
        
        // Wait between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to upload batch ${batchNum}:`, error.message);
        
        // Retry once
        console.log(`Retrying batch ${batchNum}...`);
        try {
          await new Promise(resolve => setTimeout(resolve, 3000));
          await index.upsert(batch);
          successCount += batch.length;
          console.log(`✓ Batch ${batchNum} uploaded on retry`);
        } catch (retryError) {
          console.error(`❌ Retry failed for batch ${batchNum}`);
        }
      }
    }
    
    console.log('\n✅ Upload completed!');
    console.log(`Successfully uploaded: ${successCount}/${vectors.length} vectors`);
    
    // Verify upload
    console.log('\nVerifying upload...');
    const stats = await index.describeIndexStats();
    console.log('Index stats:', stats);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
    throw error;
  }
}

uploadLegalData();