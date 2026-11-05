import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Create GoogleGenAI client with standard aistudio-build telemetry header
const getAiClient = (apiKeyOverride?: string) => {
  const key = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Check Gemini API status
app.get('/api/gemini/status', (_req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    hasEnvKey,
    defaultModel: 'gemini-3.8-flash',
    supportedModels: ['gemini-3.8-flash', 'gemini-4-argon'],
  });
});

// Primary Chat / Intelligence Endpoint using recommended gemini-3.8-flash and Google Search Grounding
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-3.8-flash',
      systemInstruction = 'You are JARVIS 4.0, a concise, highly intelligent, futuristic personal AI assistant. Keep responses under 3 sentences unless requested otherwise.',
      enableSearch = true,
      apiKey,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt string is required.' });
    }

    const ai = getAiClient(apiKey);
    if (!ai) {
      return res.status(401).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel or Settings.',
      });
    }

    // Config with optional Google Search grounding for live internet analysis
    const config: Record<string, unknown> = {
      systemInstruction,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      text,
      groundingChunks,
      model: model || 'gemini-3.8-flash',
    });
  } catch (error: unknown) {
    let message = error instanceof Error ? error.message : String(error);
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
    } catch {
      // not JSON
    }
    console.error('Gemini API Error:', message);
    return res.status(500).json({ error: message });
  }
});

// Mount Vite in development or static dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS 4.0 Full-Stack Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
