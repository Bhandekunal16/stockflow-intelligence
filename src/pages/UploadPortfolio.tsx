import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';
import { PortfolioStock, PortfolioSnapshot } from '../types/portfolio.types';
import { formatINR } from '../utils/currency';
import { calculateDifference, calculatePercentageChange } from '../utils/calculations';
import { StatBadge } from '../components/common/StatBadge';
import { useToast } from '../components/common/Toast';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  refetch: () => Promise<void>;
}

export const UploadPortfolio: React.FC = () => {
  const navigate = useNavigate();
  const { refetch } = useOutletContext<OutletContextType>();
  const { success, error: toastError } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [extractedStocks, setExtractedStocks] = useState<PortfolioStock[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFileSelection = (file: File) => {
    setErrorMessage(null);
    setExtractedStocks(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPEG, PNG, or WebP image.');
      toastError('Invalid Format', 'Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (10 MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB maximum limit.`);
      toastError('File Too Large', 'Maximum file size allowed is 10 MB.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setExtractedStocks(null);
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    try {
      setIsExtracting(true);
      setErrorMessage(null);
      setUploadProgress(10);
      setExtractionStep('Uploading image to secure server...');

      const result = await portfolioService.extractPortfolio(selectedFile, (progress) => {
        setUploadProgress(Math.min(progress, 75));
        if (progress >= 75) {
          setExtractionStep('Running Vision OCR & Parsing financial values...');
        }
      });

      setUploadProgress(100);
      setExtractionStep('Validating and indexing snapshot...');

      if (result.success && result.data && result.data.length > 0) {
        setExtractedStocks(result.data);
        success(
          'Extraction Successful',
          `Successfully extracted ${result.data.length} stocks and indexed today's snapshot.`
        );
        // Refresh snapshots in global context
        await refetch();
      } else {
        throw new Error(result.message || 'No valid stocks could be extracted.');
      }
    } catch (err: any) {
      console.error('Extraction failure:', err);
      const msg = err.message || 'Failed to extract portfolio from the screenshot.';
      setErrorMessage(msg);
      toastError('Extraction Failed', msg);
    } finally {
      setIsExtracting(false);
      setExtractionStep('');
    }
  };

  // Helper: Generate a realistic sample Zerodha Kite / Groww holding screenshot
  const handleLoadSampleScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header bar
    ctx.fillStyle = '#387ed1';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Zerodha Kite • Holdings (5)', 24, 38);

    // Summary box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(24, 80, canvas.width - 48, 80);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(24, 80, canvas.width - 48, 80);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('Total Current Value', 50, 110);
    ctx.fillText('Total Investment', 350, 110);
    ctx.fillText('Total P&L', 650, 110);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('₹ 7,54,320.00', 50, 142);
    ctx.fillText('₹ 6,85,000.00', 350, 142);

    ctx.fillStyle = '#16a34a';
    ctx.fillText('+₹ 69,320.00 (+10.12%)', 650, 142);

    // Table Header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(24, 180, canvas.width - 48, 40);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('INSTRUMENT / COMPANY', 40, 205);
    ctx.fillText('QTY (SHARES)', 380, 205);
    ctx.fillText('CURRENT VALUE', 580, 205);
    ctx.fillText('REFERENCE / INVESTED', 820, 205);

    // Sample rows
    const rows = [
      { name: 'Tata Consultancy Services Ltd. (TCS)', qty: '50', cur: '₹ 2,04,500.00', ref: '₹ 1,90,000.00' },
      { name: 'Reliance Industries Ltd. (RELIANCE)', qty: '80', cur: '₹ 2,36,000.00', ref: '₹ 2,16,000.00' },
      { name: 'HDFC Bank Ltd. (HDFCBANK)', qty: '120', cur: '₹ 1,98,000.00', ref: '₹ 1,86,000.00' },
      { name: 'Infosys Ltd. (INFY)', qty: '40', cur: '₹ 67,820.00', ref: '₹ 58,000.00' },
      { name: 'Larsen & Toubro Ltd. (LT)', qty: '12', cur: '₹ 48,000.00', ref: '₹ 35,000.00' },
    ];

    rows.forEach((row, i) => {
      const y = 240 + i * 55;
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(24, y - 25, canvas.width - 48, 50);
      ctx.strokeStyle = '#f1f5f9';
      ctx.strokeRect(24, y - 25, canvas.width - 48, 50);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(row.name, 40, y);

      ctx.fillStyle = '#334155';
      ctx.font = '14px sans-serif';
      ctx.fillText(row.qty, 380, y);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(row.cur, 580, y);

      ctx.fillStyle = '#475569';
      ctx.font = '14px sans-serif';
      ctx.fillText(row.ref, 820, y);
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'brokerage_portfolio_screenshot.png', { type: 'image/png' });
        handleFileSelection(file);
      }
    }, 'image/png');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Upload Portfolio Screenshot
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload a clear screenshot of your stock broker portfolio (Zerodha, Groww, Upstox, Angel
          One, or any broker). The backend API will automatically extract holdings, shares, and
          valuations.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        {/* Drop Zone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Drag & Drop your portfolio screenshot here
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              or <span className="text-indigo-600 font-semibold underline">browse files</span> from
              your computer
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">JPEG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PNG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">WebP</span>
              <span>• Max file size: 10 MB</span>
            </div>

            {/* Quick Test Preset Button */}
            <div className="mt-6 pt-6 border-t border-slate-200/60 w-full max-w-md">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSampleScreenshot();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all border border-indigo-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Load Sample Brokerage Screenshot (Instant Test)
              </button>
            </div>
          </div>
        ) : (
          /* File Selected & Preview Mode */
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <FileImage className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                  </p>
                </div>
              </div>

              {!isExtracting && (
                <button
                  onClick={handleRemoveImage}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Remove selected image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnail Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-96 flex items-center justify-center bg-slate-900/5">
                <img
                  src={previewUrl}
                  alt="Portfolio preview"
                  className="w-full h-auto object-contain max-h-96 rounded-2xl"
                />
              </div>
            )}

            {/* Progress Bar (when extracting) */}
            {isExtracting && (
              <div className="space-y-2 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    {extractionStep || 'Processing screenshot...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Extracting company names, quantities, market values, and invested amounts...
                </p>
              </div>
            )}

            {/* Upload Button */}
            {!extractedStocks && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isExtracting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadAndExtract}
                  disabled={isExtracting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting Holdings...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Extract Portfolio Holdings
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold">Extraction Error</h4>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Stocks Table & Results (Shown after success) */}
      {extractedStocks && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in-50 duration-300">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Extraction Complete: {extractedStocks.length} Stocks Detected
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Portfolio snapshot indexed in Asia/Kolkata timezone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  handleRemoveImage();
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
              >
                Upload Another
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Company / Asset</th>
                  <th className="py-3 px-6 text-right">Shares</th>
                  <th className="py-3 px-6 text-right">Current Value</th>
                  <th className="py-3 px-6 text-right">Reference Value</th>
                  <th className="py-3 px-6 text-right">Difference (P&L)</th>
                  <th className="py-3 px-6 text-right">% Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {extractedStocks.map((stock, idx) => {
                  const diff = calculateDifference(stock.currentValue, stock.referenceValue);
                  const pct = calculatePercentageChange(stock.currentValue, stock.referenceValue);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {stock.company}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-700">
                        {stock.shares}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                        {formatINR(stock.currentValue)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-600">
                        {formatINR(stock.referenceValue)}
                      </td>
                      <td
                        className={`py-3.5 px-6 text-right font-mono font-semibold ${
                          diff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatINR(diff, { showSign: true })}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <StatBadge percentage={pct} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
