import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './components/common/Toast';
import { Dashboard } from './pages/Dashboard';
import { UploadPortfolio } from './pages/UploadPortfolio';
import { Holdings } from './pages/Holdings';
import { PortfolioHistory } from './pages/PortfolioHistory';
import { PortfolioDetails } from './pages/PortfolioDetails';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadPortfolio />} />
            <Route path="holdings" element={<Holdings />} />
            <Route path="history" element={<PortfolioHistory />} />
            <Route path="history/:date" element={<PortfolioDetails />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
