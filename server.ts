import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Upstream portfolio API backend URL
const TARGET_API_URL = process.env.API_BACKEND_URL || 'http://147.224.251.137:8003';
const SIGNALS_API_BASE_URL =
  process.env.SIGNALS_API_BASE_URL || 'https://stock-up-agent.vercel.app';
const SCREENER_API_BASE_URL =
  process.env.SCREENER_API_BASE_URL ||
  process.env.SIGNALS_API_BASE_URL ||
  'https://stock-up-agent.vercel.app';

// Data persistence file setup for fallback
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface PortfolioStock {
  company: string;
  shares: number;
  currentValue: number;
  referenceValue: number;
}

interface PortfolioSnapshot {
  _id: string;
  date: string;
  data: PortfolioStock[];
  createdAt: string;
  updatedAt: string;
}

function loadSnapshots(): PortfolioSnapshot[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading snapshots from disk:', err);
  }
  return [];
}

function saveSnapshots(snapshots: PortfolioSnapshot[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(snapshots, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving snapshots to disk:', err);
  }
}

// Multer upload config (10MB limit, memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper for Asia/Kolkata date YYYY-MM-DD
function getKolkataDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

// API Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  let upstreamStatus = 'unknown';
  try {
    const check = await fetch(`${TARGET_API_URL}/api/portfolio`);
    upstreamStatus = check.ok ? 'connected' : `status_${check.status}`;
  } catch (e: any) {
    upstreamStatus = `unreachable: ${e.message}`;
  }

  res.json({
    success: true,
    message: 'Stock Portfolio Extraction API Gateway is active',
    upstreamTarget: TARGET_API_URL,
    upstreamStatus,
    timezone: 'Asia/Kolkata',
    currentDate: getKolkataDateString(),
    timestamp: new Date().toISOString(),
  });
});

// Root handler: Health check when queried as API, or pass through to Vite for browser navigation
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  const accept = req.headers.accept || '';
  if (accept.includes('application/json') || req.query.format === 'json') {
    return res.json({
      status: 'ok',
      success: true,
      service: 'Stock Portfolio Screenshot Extraction API Gateway',
      version: '1.0.0',
      upstreamTarget: TARGET_API_URL,
      timezone: 'Asia/Kolkata',
      endpoints: {
        health: 'GET /api/health',
        extract: 'POST /api/portfolio/extract',
        getAll: 'GET /api/portfolio',
        getByDate: 'GET /api/portfolio/:date',
      },
      timestamp: new Date().toISOString(),
    });
  }
  next();
});

// GET /api/portfolio - Retrieve all snapshots (proxied to target API, with fallback)
app.get('/api/portfolio', async (_req: Request, res: Response) => {
  try {
    const upstreamRes = await fetch(`${TARGET_API_URL}/api/portfolio`);
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err: any) {
    console.warn(`Upstream at ${TARGET_API_URL} unreachable, serving local snapshots:`, err.message);
    const snapshots = loadSnapshots();
    if (!snapshots || snapshots.length === 0) {
      return res.status(404).json({
        success: false,
        count: 0,
        data: [],
        message: 'No portfolio records found',
        statusCode: 404,
      });
    }

    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    return res.json({
      success: true,
      count: sorted.length,
      data: sorted,
    });
  }
});

// GET /api/portfolio/signals - Proxy to Vercel Portfolio Signals API (registered before /:date)
app.get('/api/portfolio/signals', async (req: Request, res: Response) => {
  const controller = new AbortController();
  const handleClose = () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  };
  req.on('close', handleClose);

  try {
    const upstreamRes = await fetch(`${SIGNALS_API_BASE_URL}/api/portfolio/signals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const rawText = await upstreamRes.text();
    try {
      const parsed = JSON.parse(rawText);
      return res.status(upstreamRes.status).json(parsed);
    } catch {
      return res.status(upstreamRes.status >= 400 ? upstreamRes.status : 502).json({
        success: false,
        message: 'Invalid JSON response received from Portfolio Signals API',
        error: rawText.slice(0, 500),
      });
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return;
    }
    console.error('Portfolio Signals API proxy error:', err);
    return res.status(502).json({
      success: false,
      message: err?.message || 'Failed to execute portfolio signals',
    });
  } finally {
    req.off('close', handleClose);
  }
});

// GET /api/screener/snapshot - Proxy stock snapshot request to Vercel backend
app.get('/api/screener/snapshot', async (req: Request, res: Response) => {
  const controller = new AbortController();
  const handleClose = () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  };
  req.on('close', handleClose);

  try {
    const params = new URLSearchParams();
    if (typeof req.query.company === 'string' && req.query.company.trim()) {
      params.set('company', req.query.company.trim().toUpperCase());
    }
    const qs = params.toString();
    const targetUrl = `${SCREENER_API_BASE_URL}/api/screener/snapshot${qs ? `?${qs}` : ''}`;

    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    const rawText = await upstreamRes.text();
    try {
      const parsed = JSON.parse(rawText);
      return res.status(upstreamRes.status).json(parsed);
    } catch {
      return res.status(upstreamRes.status >= 400 ? upstreamRes.status : 502).json({
        success: false,
        message: 'Invalid JSON response received from Screener Snapshot API',
        error: rawText.slice(0, 500),
      });
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    console.error('Screener Snapshot API proxy error:', err);
    return res.status(502).json({
      success: false,
      message: err?.message || 'Unable to reach Screener Snapshot API',
    });
  } finally {
    req.off('close', handleClose);
  }
});

// GET /api/screener/stream - Stream NDJSON stock snapshots from Vercel backend without buffering
app.get('/api/screener/stream', async (req: Request, res: Response) => {
  req.setTimeout(0);
  res.setTimeout(0);

  const controller = new AbortController();
  const handleClose = () => {
    controller.abort();
  };
  req.on('close', handleClose);

  try {
    const params = new URLSearchParams();
    if (typeof req.query.company === 'string' && req.query.company.trim()) {
      params.set('company', req.query.company.trim().toUpperCase());
    }
    if (typeof req.query.every === 'string' && req.query.every.trim()) {
      params.set('every', req.query.every.trim());
    }
    const qs = params.toString();
    const targetUrl = `${SCREENER_API_BASE_URL}/api/screener/stream${qs ? `?${qs}` : ''}`;

    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/x-ndjson, application/json' },
      signal: controller.signal,
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      try {
        const parsed = JSON.parse(errText);
        return res.status(upstreamRes.status).json(parsed);
      } catch {
        return res.status(upstreamRes.status).json({
          success: false,
          message: errText.slice(0, 500) || `Screener stream error (HTTP ${upstreamRes.status})`,
        });
      }
    }

    if (!upstreamRes.body) {
      return res.status(502).json({
        success: false,
        message: 'Upstream stream body is unavailable',
      });
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const reader = upstreamRes.body.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value && value.length > 0 && !res.writableEnded) {
          res.write(Buffer.from(value));
        }
      }
    } finally {
      reader.releaseLock();
      if (!res.writableEnded) {
        res.end();
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      if (!res.writableEnded) {
        res.end();
      }
      return;
    }
    console.error('Screener Stream API proxy error:', err);
    if (!res.headersSent) {
      return res.status(502).json({
        success: false,
        message: err?.message || 'Unable to connect to Screener Stream API',
      });
    }
    if (!res.writableEnded) {
      res.end();
    }
  } finally {
    req.off('close', handleClose);
  }
});

// GET /api/portfolio/:date - Retrieve date-specific snapshot (proxied to target API, with fallback)
app.get('/api/portfolio/:date', async (req: Request, res: Response) => {
  const { date } = req.params;
  try {
    const upstreamRes = await fetch(`${TARGET_API_URL}/api/portfolio/${date}`);
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err: any) {
    console.warn(`Upstream at ${TARGET_API_URL} unreachable, serving local snapshot for date ${date}:`, err.message);
    const snapshots = loadSnapshots();
    const snapshot = snapshots.find((s) => s.date === date);

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message: `No portfolio records found for date: ${date}`,
        statusCode: 404,
      });
    }

    return res.json({
      success: true,
      data: snapshot,
    });
  }
});

// POST /api/portfolio/extract - Extract stock portfolio from image
app.post(
  '/api/portfolio/extract',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size exceeds 10 MB limit',
            statusCode: 413,
          });
        }
        if (err.message === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only JPEG, PNG, and WebP images are supported.',
            statusCode: 400,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Invalid upload request',
          statusCode: 400,
        });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: Missing required file field "image"',
        statusCode: 400,
      });
    }

    // Try forwarding to upstream target API first
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
      formData.append('image', blob, req.file.originalname || 'screenshot.png');

      const upstreamRes = await fetch(`${TARGET_API_URL}/api/portfolio/extract`, {
        method: 'POST',
        body: formData,
      });

      if (upstreamRes.ok) {
        const upstreamData = await upstreamRes.json();
        return res.status(upstreamRes.status).json(upstreamData);
      }
    } catch (upstreamErr: any) {
      console.warn('Upstream extraction failed, falling back to server-side Gemini OCR:', upstreamErr.message);
    }

    // Fallback: Local Gemini Vision extraction
    try {
      const buffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      const base64Data = buffer.toString('base64');

      let extractedStocks: PortfolioStock[] = [];

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const prompt = `Analyze this stock portfolio screenshot (e.g. from Zerodha Kite, Groww, Upstox, Angel One, ICICI Direct, Robinhood, or any brokerage).
Extract every individual stock holding visible in the screenshot.
For each holding entry:
- company: Company name or ticker symbol (e.g. "Tata Consultancy Services Ltd.", "Reliance Industries Ltd.", "HDFC Bank Ltd.", "Infosys Ltd.")
- shares: Number of shares or quantity held (positive number). If fractional, parse decimal; if integer, parse integer.
- currentValue: Total current market value of this holding in Indian Rupees / currency units (number).
- referenceValue: Total invested / buy / reference value of this holding in Indian Rupees / currency units (number). If only average buy price is visible, calculate referenceValue = shares * avgBuyPrice. If only current value and P&L is visible, referenceValue = currentValue - P&L.

Do NOT invent fake stock data. If the image is not a portfolio or contains no stock holdings, return an empty array.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    shares: { type: Type.NUMBER },
                    currentValue: { type: Type.NUMBER },
                    referenceValue: { type: Type.NUMBER },
                  },
                  required: ['company', 'shares', 'currentValue', 'referenceValue'],
                },
              },
            },
          });

          const rawText = (response.text || '').trim();
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed)) {
              extractedStocks = parsed.map((item: any) => ({
                company: String(item.company || '').trim(),
                shares: Number(item.shares) || 0,
                currentValue: Number(item.currentValue) || 0,
                referenceValue: Number(item.referenceValue) || 0,
              }));
            }
          }
        } catch (geminiError: any) {
          console.error('Gemini vision extraction error:', geminiError);
        }
      }

      const validStocks = extractedStocks.filter(
        (s) => s.company.length > 0 && s.shares > 0 && s.currentValue >= 0 && s.referenceValue >= 0
      );

      if (validStocks.length === 0) {
        return res.status(422).json({
          success: false,
          message:
            'Portfolio extraction or validation failed: Unable to detect readable stock holding entries from the uploaded image. Please ensure the screenshot clearly displays company names, shares, current values, and reference values.',
          statusCode: 422,
        });
      }

      const todayDate = getKolkataDateString();
      const snapshots = loadSnapshots();
      const existingIndex = snapshots.findIndex((s) => s.date === todayDate);

      const nowIso = new Date().toISOString();
      if (existingIndex >= 0) {
        snapshots[existingIndex].data = validStocks;
        snapshots[existingIndex].updatedAt = nowIso;
      } else {
        const newSnapshot: PortfolioSnapshot = {
          _id: 'snap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          date: todayDate,
          data: validStocks,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        snapshots.push(newSnapshot);
      }

      saveSnapshots(snapshots);

      return res.status(200).json({
        success: true,
        count: validStocks.length,
        data: validStocks,
      });
    } catch (err: any) {
      console.error('Extraction error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error occurred during portfolio extraction: ' + (err.message || 'Unknown error'),
        statusCode: 500,
      });
    }
  }
);

// Optional helper endpoint: Reset or clear data
app.delete('/api/portfolio', async (_req: Request, res: Response) => {
  try {
    await fetch(`${TARGET_API_URL}/api/portfolio`, { method: 'DELETE' });
  } catch (e) {
    // Ignore upstream delete failure
  }
  saveSnapshots([]);
  res.json({ success: true, message: 'All portfolio snapshots cleared' });
});

// Vite middleware or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  let viteInstance: any = null;

  const viteReady = !isProduction
    ? import('vite')
        .then(({ createServer: createViteServer }) =>
          createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
          })
        )
        .then((vite) => {
          viteInstance = vite;
          return vite;
        })
        .catch((err) => {
          console.error('Failed to initialize Vite dev middleware:', err);
          throw err;
        })
    : Promise.resolve(null);

  if (!isProduction) {
    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const vite = viteInstance || (await viteReady);
        if (!vite) return next();
        return vite.middlewares(req, res, next);
      } catch (err) {
        return next(err);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Stock Portfolio App server running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Connected to upstream portfolio backend: ${TARGET_API_URL}`);
  });

  const shutdown = async () => {
    server.close();
    if (viteInstance && typeof viteInstance.close === 'function') {
      try {
        await viteInstance.close();
      } catch {
        // Ignore Vite close errors during shutdown
      }
    }
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
