import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getLegalAnswerWithRAG } from './services/rag-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// Routes
app.post('/api/legal-answer', async (req, res) => {
  try {
    const { crimeDescription } = req.body;
    
    if (!crimeDescription) {
      return res.status(400).json({ error: 'Crime description is required' });
    }
    
    const answer = await getLegalAnswerWithRAG(crimeDescription);
    
    res.json({ answer });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Legal Chatbot Backend is running' });
});

app.listen(PORT, () => {
 console.log(`🚀 Server running on port ${PORT}`);

});