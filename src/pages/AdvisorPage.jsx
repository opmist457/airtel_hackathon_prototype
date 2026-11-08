import React from 'react';
import { AdvisorChat } from '../components/Advisor/AdvisorChat.jsx';

/**
 * AdvisorPage - Container page for the Airtel Udyam Digital AI Business Advisor
 * Uses flex layout to fill viewport height without page scrolling
 */
export function AdvisorPage() {
  return (
    <div className="advisor-page" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 80px)',
      overflow: 'hidden',
      padding: '0 16px'
    }}>
      {/* Page Header - compact */}
      <header style={{
        textAlign: 'center',
        padding: '12px 0 8px',
        flexShrink: 0
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 14px',
          background: 'rgba(237, 28, 36, 0.1)',
          border: '1px solid rgba(237, 28, 36, 0.2)',
          borderRadius: '100px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: '#ED1C24',
          marginBottom: '8px'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#ED1C24', boxShadow: '0 0 6px rgba(237,28,36,0.5)'
          }}></span>
          GenAI Needs Discovery
        </div>

        <h1 style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          marginBottom: '4px'
        }}>
          AI Business Advisor
        </h1>

        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.4
        }}>
          Answer 7 quick questions. Our GenAI engine analyzes 25+ Airtel Business products
          to tailor an instant, cost-optimized bundle for you.
        </p>
      </header>

      {/* Chat Component - fills remaining space */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <AdvisorChat />
      </div>
    </div>
  );
}

export default AdvisorPage;
