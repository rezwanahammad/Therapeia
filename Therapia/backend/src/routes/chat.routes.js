const express = require('express');
const router = express.Router();
const { generateGeminiContent } = require('../services/gemini');

// POST /api/chat
// Body: { prompt: string }
router.post('/', async (req, res, next) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }
    const responseText = await generateGeminiContent(prompt.trim());
    return res.json({ text: responseText });
  } catch (err) {
    next(err);
  }
});

module.exports = router;