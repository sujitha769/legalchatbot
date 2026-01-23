const API_URL = 'http://localhost:5000/api';

export const getLegalAnswer = async (crimeText) => {
  try {
    const response = await fetch(`${API_URL}/legal-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crimeDescription: crimeText
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get legal answer');
    }
    
    const data = await response.json();
    return data.answer;
    
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to get legal answer: " + error.message);
  }
};