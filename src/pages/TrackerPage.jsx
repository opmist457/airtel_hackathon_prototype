import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Headphones,
  CheckCircle2,
  ExternalLink,
  Wifi,
  Sparkles
} from 'lucide-react';
import OrderTracker from '../components/Tracker/OrderTracker';
import './TrackerPage.css';

function readKycHandoff(locationState) {
  if (locationState?.kycComplete || locationState?.businessName) return locationState;
  try {
    const stored = sessionStorage.getItem('udyam_kyc');
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore a stale handoff.
  }
  return null;
}

function maskId(value) {
  if (!value || value.length < 8) return value || '';
  return `${value.slice(0, 2)}**********${value.slice(-3)}`;
}

export default function TrackerPage() {
  const location = useLocation();
  const handoff = useMemo(() => readKycHandoff(location.state), [location.state]);
  const orderBundle = useMemo(() => {
    if (!handoff) return null;
    const products = Array.isArray(handoff.selectedProducts) ? handoff.selectedProducts : [];
    const items = products.map((product) => ({
      id: product.product_id || product.id,
      name: product.product_name || product.name,
      category: product.category || 'Bundle',
      desc: product.description || product.desc || '',
      price: product.lineMonthly || product.price_min_inr_per_month || product.price || 0,
      installDays: product.typical_install_days || product.installDays || 5,
    }));
    return {
      companyName: handoff.businessName || 'Verified MSME',
      customerName: 'Authorised signatory',
      gstin: maskId(handoff.gstin),
      siteAddress: 'Principal place of business on the verified GST certificate',
      items,
    };
  }, [handoff]);

  const [searchInput, setSearchInput] = useState('UDY-2026-8842');
  const [activeOrderId, setActiveOrderId] = useState('UDY-2026-8842');
  const [searchFeedback, setSearchFeedback] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setActiveOrderId(searchInput.trim().toUpperCase());
    setSearchFeedback(`Loaded tracking data for order reference: ${searchInput.trim().toUpperCase()}`);
    setTimeout(() => setSearchFeedback(''), 4000);
  };

  return (
    <div className="tracker-page-root">
      {/* Lookup Bar & Breadcrumbs */}
      <div className="tracker-lookup-section">
        <div className="tracker-lookup-box">
          <div className="tracker-breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/tracker">Track Order</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{activeOrderId}</span>
          </div>

          <form className="tracker-search-form" onSubmit={handleSearch}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              className="tracker-search-input"
              placeholder="Order ID / GSTIN"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="tracker-search-btn">
              Track
            </button>
          </form>
        </div>

        {searchFeedback && (
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.82rem',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>{searchFeedback}</span>
          </div>
        )}
      </div>

      {/* Main Order Tracker Component */}
      <main>
        <OrderTracker
          orderId={activeOrderId}
          orderDate="2026-07-15"
          currentStageIndex={handoff?.kycComplete ? 1 : 2}
          orderBundle={orderBundle}
        />
      </main>

      {/* Frequently Asked Questions */}
      <section className="tracker-faq-section">
        <div className="tracker-faq-card">
          <h2 className="tracker-faq-title">Frequently Asked Questions</h2>
          <p className="tracker-faq-subtitle">
            Everything you need to know about Airtel Accel Business doorstep deployment and zero-touch activation.
          </p>

          <div className="tracker-faq-grid">
            <div className="tracker-faq-item">
              <h4 className="tracker-faq-q">
                <HelpCircle size={16} color="#ED1C24" />
                What happens during the installation visit?
              </h4>
              <p className="tracker-faq-a">
                Our certified senior field engineer routes dedicated optical fibre to your premises, installs the Wi-Fi 6
                router, calibrates signal dBm levels, and performs a live speed-test verification certificate.
              </p>
            </div>

            <div className="tracker-faq-item">
              <h4 className="tracker-faq-q">
                <HelpCircle size={16} color="#ED1C24" />
                Can I reschedule if my site isn't ready?
              </h4>
              <p className="tracker-faq-a">
                Yes, completely free of charge. Use the "Reschedule Slot" button in the active stage above or reply directly
                to our WhatsApp concierge with your new preferred date.
              </p>
            </div>

            <div className="tracker-faq-item">
              <h4 className="tracker-faq-q">
                <HelpCircle size={16} color="#ED1C24" />
                How are Static IPs and Cloud Services provisioned?
              </h4>
              <p className="tracker-faq-a">
                Static IP routing, Airtel IQ cloud trunks, and Office 365 credentials are pre-provisioned in parallel on our
                cloud switchboard so they become active immediately upon physical fibre splice.
              </p>
            </div>

            <div className="tracker-faq-item">
              <h4 className="tracker-faq-q">
                <HelpCircle size={16} color="#ED1C24" />
                What is the security entry code?
              </h4>
              <p className="tracker-faq-a">
                To guarantee zero unauthorized entry into your office, our technician will share their matching PIN
                before entering your premises.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
