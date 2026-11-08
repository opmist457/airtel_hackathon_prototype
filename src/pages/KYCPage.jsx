import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import KYCFlow from '../components/KYC/KYCFlow';

export default function KYCPage() {
  const location = useLocation();

  const quoteData = useMemo(() => {
    const state = location.state;
    if (state && (state.fromQuote || state.selectedProducts || state.businessProfile)) {
      return state;
    }
    try {
      const stored = sessionStorage.getItem('udyam_quote');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore a stale quote payload.
    }
    return null;
  }, [location.state]);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge-green">Instant Registry Check</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DPDP 2023 Compliant</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Smart KYC</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '720px' }}>
          Consent, GSTIN lookup, Udyam cross-check, specimen OCR, then a masked summary.
          Identifiers stay masked. Non-active registrations cannot continue.
        </p>
      </header>
      <KYCFlow quoteData={quoteData} />
    </div>
  );
}
