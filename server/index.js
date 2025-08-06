// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./routes/stripe');
const musicbrainzRoutes = require('./routes/musicbrainz'); // Add this line
const llmRoutes = require('./routes/llm'); // Add this line

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Your Vue.js dev server URL
  credentials: true
}));

// IMPORTANT: Raw body parser for webhooks MUST come BEFORE json parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json());

// Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/musicbrainz', musicbrainzRoutes); // Add this line
app.use('/api/llm', llmRoutes); // Add this line

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment variables loaded:');
  console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.log('- STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
  console.log('🎵 MusicBrainz API available at: http://localhost:' + PORT + '/api/musicbrainz');
  console.log('🤖 LLM API available at: http://localhost:' + PORT + '/api/llm'); // Add this line
});