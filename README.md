# StockFolio – Stock Portfolio Management & Screenshot Extraction Dashboard

A modern, responsive, production-ready fintech web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Express** that integrates with an automated Stock Portfolio Screenshot Extraction API.

## 🚀 Key Features

1. **Screenshot Upload & OCR Extraction**:
   - Supports JPEG, PNG, and WebP formats up to 10 MB.
   - Extracts holdings, company names, shares, current values, and reference values.
   - Financial sanity validation: rejects corrupt files with user-friendly error feedback.
   - Built-in instant test screenshot generator for demonstration and evaluation.

2. **Executive Financial Dashboard**:
   - **Total Portfolio Value**, **Reference / Invested Capital**, **Net Difference (P&L)**, and **Percentage Change**.
   - Safe zero-reference value handling `((currentValue - referenceValue) / referenceValue) * 100`.
   - Indian Rupee (₹) formatting with `en-IN` numbering conventions.
   - Area and bar chart trends using **Recharts**.
   - Top 5 holdings ranked with sorting and quick navigation.

3. **Date-wise Portfolio Snapshots (Asia/Kolkata Timezone)**:
   - Indexes exactly one snapshot per date using `Asia/Kolkata` timezone.
   - Re-uploading on the same date updates that day's record.
   - Previous and next snapshot navigation on date details view (`/history/:date`).

4. **Historical Comparisons**:
   - Timeline listing of all snapshots.
   - Side-by-side snapshot comparison modal calculating absolute and percentage deltas.

5. **Visual Portfolio Analytics**:
   - Asset allocation pie chart with smart grouping for top holdings.
   - Current Value vs Reference Value comparative bar chart.
   - Top performing gainers and underperforming laggards.
   - Historical valuation trajectory.

6. **Centralized API Architecture**:
   - Centralized Axios client (`src/services/api.ts`) with custom error interceptors for 400, 404, 413, 422, and 500 status codes.
   - Configurable via `VITE_API_BASE_URL`.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Router**: React Router DOM v7
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Dates**: Day.js
- **Backend / API**: Express, Multer, Tsx, Google GenAI SDK

---

## 📡 API Contract

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check and API status |
| `POST` | `/api/portfolio/extract` | Upload screenshot (`image` field) and extract holdings |
| `GET` | `/api/portfolio` | Retrieve all historical snapshots (sorted chronologically) |
| `GET` | `/api/portfolio/:date` | Retrieve snapshot for a specific `YYYY-MM-DD` date |
| `DELETE` | `/api/portfolio` | Reset all portfolio snapshots (for maintenance/testing) |

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Optional custom base URL (defaults to current origin)
VITE_API_BASE_URL=http://localhost:3000

# Required for Gemini Vision OCR extraction
GEMINI_API_KEY=your_gemini_api_key_here

# Port configuration
PORT=3000
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application and backend API will run concurrently at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
npm start
```
