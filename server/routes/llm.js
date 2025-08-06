// server/routes/llm.js
const express = require('express');
const { Ollama } = require('ollama');
const router = express.Router();

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Generate theme based on user instruction
router.post('/generate-theme', async (req, res) => {
  const { instruction } = req.body;

  if (!instruction) {
    return res.status(400).json({ error: 'Instruction is required' });
  }

const prompt = `
You are an expert front-end designer. Based on the instruction "${instruction}", generate a <style scoped> block ONLY for a Vue 3 component called "ThemeMinimal.vue".

Strict rules:
- Do NOT include boilerplate HTML or JavaScript
- Do NOT include SCSS or nesting (e.g. no "& h1" or similar)
- ONLY use valid, raw CSS
- Output a single <style scoped> block with:

1. CSS variables under :root (e.g. --background-color, --text-color, etc.)
2. Styles for the .minimal-theme class (font, colors, layout)
3. Style ALL relevant elements and classes used in ThemeMinimal.vue:

- h1, h2, h3, p, a, hr, button
- .cover, .cover-placeholder
- nav, ul, li, .active
- .tab-content, .about, .shows, .releases, .merch, .contact
- .show-item, .release-item, .merch-item
- .release-info, .merch-info, .release-links, .merch-grid, .buy-button
- .shows-list, .releases-list, .merch-list, .contact-links, .socials

Use soft shadows, clean layout, hover effects, spacing, and elegant pastel colors.

ONLY return the <style scoped> block — no markdown, no explanations.
`;



  try {
    const response = await ollama.chat({
      model: 'llama3:8b',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });

    const raw = response?.message?.content || '';

    if (!raw.includes('<style scoped>')) {
      throw new Error('AI response missing <style scoped>');
    }

    // Clean up response
    const cleaned = raw.replace(/```(vue|html|css)?/g, '').trim();

    return res.json({
      success: true,
      code: cleaned,
      themeId: `ai-${Date.now()}`
    });
  } catch (error) {
    console.error('❌ AI theme error:', error);
    res.status(500).json({ error: error.message });
  }
});



// List available models
router.get('/models', async (req, res) => {
  try {
    const models = await ollama.list();
    res.json({ models: models.models });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pull a model
router.post('/pull-model', async (req, res) => {
  try {
    const { model } = req.body;
    
    if (!model) {
      return res.status(400).json({ error: 'Model name is required' });
    }

    console.log('📥 Pulling model:', model);
    
    await ollama.pull({ model });
    
    res.json({ success: true, message: `Model ${model} pulled successfully` });
  } catch (error) {
    console.error('Error pulling model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check for LLM service
router.get('/health', async (req, res) => {
  try {
    const models = await ollama.list();
    res.json({ 
      status: 'LLM service is running',
      modelsCount: models.models.length,
      availableModels: models.models.map(m => m.name)
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'LLM service error',
      error: error.message 
    });
  }
});

module.exports = router;