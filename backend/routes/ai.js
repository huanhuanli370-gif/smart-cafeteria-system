const express = require('express');
const router = express.Router();
const { authRequired } = require('../middlewares/auth');

// This is the endpoint your app will call
router.post('/chat', authRequired, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  try {
    const [menuRows] = await req.db.execute('SELECT name, description, price, category FROM menus WHERE is_available = TRUE');

    // Format the menu data into a clean, text-based format for the AI
    let menuContext = "Here is the current menu:\n";
    const groupedMenu = menuRows.reduce((acc, item) => {
      const { category } = item;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(`- ${item.name} ($${Number(item.price).toFixed(2)}): ${item.description}`);
      return acc;
    }, {});

    for (const category in groupedMenu) {
      menuContext += `\nCategory: ${category}\n`;
      menuContext += groupedMenu[category].join('\n');
    }

    // --- Gemini API Call ---
    const apiKey = process.env.GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // A system prompt that now INCLUDES the menu data as context
    const systemPrompt = `You are a friendly and helpful AI assistant for the Smart Cafeteria System. 
    Your goal is to answer questions about the menu, help users decide what to eat, and provide information about our services. 
    Base your answers STRICTLY on the menu data provided below. If a question is unrelated to the cafeteria or the menu, politely decline to answer.
    Keep your answers concise, friendly, and relevant.

    ${menuContext}`; // Inject the formatted menu here

    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Gemini API Error:", errorBody);
        throw new Error('Failed to get a response from the AI service.');
    }

    const result = await apiResponse.json();
    const aiReply = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      throw new Error("The AI didn't provide a valid response.");
    }
    
    // Send the AI's reply back to the frontend
    res.json({ success: true, data: { reply: aiReply } });

  } catch (error) {
    console.error('Error in /ai/chat:', error);
    res.status(500).json({ success: false, error: 'An internal error occurred.' });
  }
});

module.exports = router;
