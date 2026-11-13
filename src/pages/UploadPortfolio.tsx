import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  X,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';
import { PortfolioStock, PortfolioSnapshot } from '../types/portfolio.types';
import { calculateStockSummary } from '../utils/calculations';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { PortfolioKpiStrip } from '../components/portfolio/PortfolioKpiStrip';
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

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPEG, PNG, or WebP image.');
      toastError('Invalid Format', 'Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB maximum limit.`
      );
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

  const handleLoadSampleScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1100;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#387ed1';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Zerodha Kite • Holdings (5)', 24, 38);

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

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(24, 180, canvas.width - 48, 40);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('INSTRUMENT / COMPANY', 40, 205);
    ctx.fillText('QTY (SHARES)', 380, 205);
    ctx.fillText('CURRENT VALUE', 580, 205);
    ctx.fillText('REFERENCE / INVESTED', 820, 205);

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

  const extractedSummary = extractedStocks ? calculateStockSummary(extractedStocks) : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Upload Portfolio Screenshot
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
          Upload a clear screenshot of your stock broker portfolio (Zerodha, Groww, Upstox, Angel
          One, or any broker). Holdings are extracted automatically and indexed in Asia/Kolkata
          timezone.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-2xl border border-[var(--border-default)] space-y-5">
        {!selectedFile ? (
          <>
            {/* Keyboard-accessible Drop Zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload portfolio screenshot by clicking or dropping a file"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                  : 'border-[var(--border-default)] hover:border-[var(--accent-primary)]/70 bg-[var(--bg-canvas)]/60 hover:bg-[var(--bg-canvas)]'
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
              <div
                aria-hidden="true"
                className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent-primary)] mb-4"
              >
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                Drag & Drop your portfolio screenshot here
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                or <span className="text-[var(--accent-primary)] font-semibold underline">browse files</span>{' '}
                from your computer
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
                <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] font-medium">
                  JPEG
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] font-medium">
                  PNG
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] font-medium">
                  WebP
                </span>
                <span>• Max file size: 10 MB</span>
              </div>
            </div>

            {/* Separate secondary sample action (prevents nested clickable conflict) */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-secondary)]">
                Want to preview extraction without a screenshot?
              </p>
              <button
                type="button"
                onClick={handleLoadSampleScreenshot}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)] text-[var(--accent-primary)] text-xs font-semibold transition-colors border border-[var(--border-default)] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" aria-hidden="true" />
                Load Sample Brokerage Screenshot
              </button>
            </div>
          </>
        ) : (
          /* File Selected & Preview Mode */
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  aria-hidden="true"
                  className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
                >
                  <FileImage className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{selectedFile.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                  </p>
                </div>
              </div>

              {!isExtracting && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  aria-label="Remove selected image"
                  title="Remove selected image"
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--status-error)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Thumbnail Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border-default)] max-h-96 flex items-center justify-center bg-[var(--bg-canvas)]">
                <img
                  src={previewUrl}
                  alt={`Preview of ${selectedFile.name}`}
                  className="w-full h-auto object-contain max-h-96 rounded-2xl"
                />
              </div>
            )}

            {/* Progress Bar */}
            {isExtracting && (
              <div
                role="status"
                aria-live="polite"
                className="space-y-2 p-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--accent-primary)]/40"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-primary)]" aria-hidden="true" />
                    {extractionStep || 'Processing screenshot...'}
                  </span>
                  <span className="font-mono text-[var(--accent-primary)]">{uploadProgress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden"
                >
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Extracting company names, quantities, market values, and invested amounts...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!extractedStocks && (
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isExtracting}
                  className="px-5 py-2.5 min-h-[42px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadAndExtract}
                  disabled={isExtracting}
                  className="flex items-center gap-2 px-6 py-2.5 min-h-[42px] rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Extracting Holdings...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" aria-hidden="true" />
                      <span>Extract Portfolio Holdings</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 flex items-start gap-3 text-[var(--status-error)]"
          >
            <ShieldAlert className="w-5 h-5 text-[var(--status-error)] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs">
              <h4 className="font-bold">Extraction Error</h4>
              <p className="mt-0.5 leading-relaxed text-[var(--text-primary)]/90">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Stocks Summary & Table */}
      {extractedStocks && extractedSummary && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--status-success)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Extraction Complete: {extractedStocks.length} Stocks Detected
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Portfolio snapshot indexed in Asia/Kolkata timezone.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 min-h-[40px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-semibold transition-colors cursor-pointer"
              >
                Upload Another
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <PortfolioKpiStrip
            totalCurrentValue={extractedSummary.totalCurrentValue}
            totalReferenceValue={extractedSummary.totalReferenceValue}
            totalDifference={extractedSummary.totalDifference}
            percentageChange={extractedSummary.percentageChange}
          />

          <HoldingsTable
            stocks={extractedStocks}
            title="Extracted Portfolio Holdings"
            subtitle={`Extracted ${extractedStocks.length} position${
              extractedStocks.length === 1 ? '' : 's'
            } from screenshot`}
          />
        </div>
      )}
    </div>
  );
};
