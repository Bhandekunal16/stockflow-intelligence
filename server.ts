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
const PORT = 3000;

// Data persistence file setup
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

// Helper for Asia/Kolkata date YYYY-MM-DD
function getKolkataDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Stock Portfolio Extraction API is healthy',
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
      service: 'Stock Portfolio Screenshot Extraction API',
      version: '1.0.0',
      timezone: 'Asia/Kolkata',
      endpoints: {
        health: 'GET /',
        extract: 'POST /api/portfolio/extract',
        getAll: 'GET /api/portfolio',
        getByDate: 'GET /api/portfolio/:date',
      },
      timestamp: new Date().toISOString(),
    });
  }
  next();
});

// GET /api/portfolio - Retrieve all snapshots
app.get('/api/portfolio', (_req: Request, res: Response) => {
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

  // Sort chronologically ascending
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));

  return res.json({
    success: true,
    count: sorted.length,
    data: sorted,
  });
});

// GET /api/portfolio/:date - Retrieve date-specific snapshot (YYYY-MM-DD)
app.get('/api/portfolio/:date', (req: Request, res: Response) => {
  const { date } = req.params;
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
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: Missing required file field "image"',
          statusCode: 400,
        });
      }

      const buffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      const base64Data = buffer.toString('base64');

      let extractedStocks: PortfolioStock[] = [];

      // Check Gemini API key
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
          // If Gemini fails, we will check if validation fails below
        }
      }

      // Financial validation: Each stock must have valid company name and non-negative numbers
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

      // Update or create snapshot for today in Asia/Kolkata timezone
      const todayDate = getKolkataDateString();
      const snapshots = loadSnapshots();
      const existingIndex = snapshots.findIndex((s) => s.date === todayDate);

      const nowIso = new Date().toISOString();
      if (existingIndex >= 0) {
        // Subsequent upload on the same date updates that day's snapshot
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

// Optional helper endpoint: Reset or clear data (for settings/testing)
app.delete('/api/portfolio', (_req: Request, res: Response) => {
  saveSnapshots([]);
  res.json({ success: true, message: 'All portfolio snapshots cleared' });
});

// Vite middleware or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Stock Portfolio App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
