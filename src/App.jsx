import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AdvisorPage from './pages/AdvisorPage';
import QuotePage from './pages/QuotePage';
import KYCPage from './pages/KYCPage';
import TrackerPage from './pages/TrackerPage';
import PrivacyPage from './pages/PrivacyPage';
import { ExternalLink, FileText, ArrowLeft } from 'lucide-react';

/**
 * Embedded Viewer / Opener for Architecture and Business Case docs.
 * Provides instant in-app viewing with a dedicated "Open in New Tab" action.
 */
function ExternalDocViewer({ docPath, title, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem 1.75rem',
        background: 'rgba(18, 22, 33, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        backdropFilter: 'blur(16px)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-red">Documentation</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project Udyam Digital</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>{title}</h2>
          {description && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {description}
            </p>
          )}
        </div>

        <a
          href={docPath}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <span>Open Fullscreen</span>
          <ExternalLink size={16} />
        </a>
      </div>

      <div style={{
        width: '100%',
        height: '75vh',
        minHeight: '600px',
        background: '#07080b',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <iframe
          src={docPath}
          title={title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Main Funnel Routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Hackathon Documentation Routes */}
          <Route
            path="/architecture"
            element={
              <ExternalDocViewer
                docPath="/docs/architecture.html"
                title="System & Cloud Architecture"
                description="Technical blueprint covering event streaming, DPDP tokenization, and mock registry lookups."
              />
            }
          />
          <Route
            path="/business-case"
            element={
              <ExternalDocViewer
                docPath="/docs/business_case.html"
                title="Commercial Business Case & Financial Model"
                description="Conversion analysis across 5,000 SMB leads with CAC compression and ARR projections."
              />
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
