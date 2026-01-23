// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// // Initialize the Gemini AI client
// const genAI = new GoogleGenerativeAI(API_KEY);

// export const getLegalAnswer = async (crimeText) => {
//   // Validate API key
//   if (!API_KEY) {
//     throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
//   }

//   const prompt = `
// You are a legal expert in India specializing in IPC and BNS.

// Crime description: "${crimeText}"

// Provide the applicable legal sections in this EXACT format:

// INDIAN PENAL CODE (IPC)

// Section: [section number]
// Title: [section title]
// Punishment: [punishment details]

// BHARATIYA NYAYA SANHITA (BNS)

// Section: [section number]
// Title: [section title]
// Punishment: [punishment details]

// Rules:
// - Use clear line breaks between each field
// - Be specific and accurate
// - Keep it concise
// - No extra disclaimers
// - No emojis
// `;

//   try {
//     console.log(`Generating legal answer for crime: ${crimeText.substring(0, 50)}...`);

//     // Use gemini-2.5-flash (latest 2.x flash model)
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
//     // Generate content
//     const result = await model.generateContent(prompt);
    
//     const response = await result.response;
//     const text = response.text().replace(/```json|```/g, '').trim();
    
//     console.log("Gemini Response:", text);
    
//     return text;

//   } catch (error) {
//     console.error("Legal Answer Error Full:", error);
//     if (error.response) {
//       console.error("Legal Answer Error Response:", JSON.stringify(error.response, null, 2));
//     }
//     throw new Error("Failed to get legal answer: " + error.message);
//   }
// };