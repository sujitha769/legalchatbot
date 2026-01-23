import { GoogleGenerativeAI } from '@google/generative-ai';
import { pc, indexName } from '../config/pinecone.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getLegalAnswerWithRAG(crimeText) {
  try {
    console.log(`Processing query: ${crimeText.substring(0, 50)}...`);
    
    // Step 1: Create embedding for the crime description
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(crimeText);
    const queryEmbedding = embeddingResult.embedding.values;
    
    // Step 2: Search Pinecone for relevant sections
    const index = pc.index(indexName);
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 6,
      includeMetadata: true
    });
    
    console.log(`Found ${searchResults.matches.length} relevant sections`);
    
    // Step 3: Extract relevant legal sections
    const relevantSections = searchResults.matches
      .filter(match => match.score > 0.5) // Only use highly relevant matches
      .map(match => match.metadata);
    
    if (relevantSections.length === 0) {
      return "No applicable legal sections found in the database for the described crime. Please provide more details or rephrase your description.";
    }
    
    // Step 4: Build context from retrieved sections
    let context = "RELEVANT LEGAL SECTIONS FROM DATABASE:\n\n";
    
    const ipcSections = relevantSections.filter(s => s.type === 'IPC');
    const bnsSections = relevantSections.filter(s => s.type === 'BNS');
    
    if (ipcSections.length > 0) {
      context += "INDIAN PENAL CODE (IPC):\n";
      ipcSections.forEach(section => {
        context += `Section ${section.section}: ${section.title}\n`;
        context += `Description: ${section.description}\n`;
        context += `Punishment: ${section.punishment}\n\n`;
      });
    }
    
    if (bnsSections.length > 0) {
      context += "BHARATIYA NYAYA SANHITA (BNS):\n";
      bnsSections.forEach(section => {
        context += `Section ${section.section}: ${section.title}\n`;
        context += `Description: ${section.description}\n`;
        context += `Punishment: ${section.punishment}\n\n`;
      });
    }
    
    // Step 5: Create prompt with retrieved context
    const prompt = `You are a legal expert assistant for Indian law. Use ONLY the information provided below to answer the query.

${context}

Crime description: "${crimeText}"

Based ONLY on the relevant sections provided above, format your response as follows:

INDIAN PENAL CODE (IPC)

Section: [section number]
Title: [section title]
Punishment: [punishment details from database]

BHARATIYA NYAYA SANHITA (BNS)

Section: [section number]
Title: [section title]
Punishment: [punishment details from database]

CRITICAL RULES:
- Use ONLY the sections provided in the context above
- Copy the punishment details EXACTLY as provided in the database
- Do NOT add, modify, or invent any information
- If multiple sections apply, list all of them
- If no section from a particular code (IPC/BNS) applies, skip that section entirely
- Be accurate and use the exact wording from the database
`;

    // Step 6: Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log("Generated response with RAG");
    return text;

  } catch (error) {
    console.error("RAG Service Error:", error);
    throw new Error("Failed to get legal answer: " + error.message);
  }
}