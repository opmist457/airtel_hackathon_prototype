import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileCheck,
  BarChart3,
  Users,
  Award,
  ChevronRight,
  Bot,
  PackageCheck,
  FileText,
  Lock,
  Compass
} from 'lucide-react';
import './DashboardPage.css';

/**
 * Animated counter hook with smooth ease-out
 */
function useAnimatedCounter(endVal, duration = 1600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animFrame = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * endVal));

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setCount(endVal);
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [endVal, duration]);

  return count;
}

export default function DashboardPage() {
  // Animated counters
  const productsCount = useAnimatedCounter(25, 1400);
  const smbCount = useAnimatedCounter(5000, 1800);
  const daysCount = useAnimatedCounter(7, 1200);
  const satisfactionCount = useAnimatedCounter(95, 1600);

  // Funnel analytics state
  const [funnelData, setFunnelData] = useState(null);
  const [loadingFunnel, setLoadingFunnel] = useState(true);

  // Fallback / Initial Leads Data
  const fallbackFunnel = {
    total_leads: 5000,
    funnel: [
      { stage: 'Lead Generation', count: 5000, rate: 100 },
      { stage: 'Contacted', count: 3406, rate: 68.1 },
      { stage: 'Needs Assessed', count: 1974, rate: 39.5 },
      { stage: 'Quote Accepted', count: 861, rate: 17.2 },
      { stage: 'KYC Complete', count: 588, rate: 11.8 },
      { stage: 'Activated', count: 368, rate: 7.4 }
    ],
    activated_stats: {
      count: 368,
      avg_days_to_activation: 17.6,
      avg_monthly_bundle_value: 12351,
      churn_rate_6m: 15.2
    },
    gstin_impact: {
      with_gstin: { rate: 9.6 },
      without_gstin: { rate: 2.0 }
    }
  };

  useEffect(() => {
    fetch('/data/leads_summary.json')
      .then((res) => {
        if (!res.ok) throw new Error('Data fetch failed');
        return res.json();
      })
      .then((data) => {
        if (data && data.funnel) {
          const total = data.total_leads || 5000;
          const enrichedFunnel = data.funnel.map((item) => ({
            ...item,
            rate: Math.round((item.count / total) * 1000) / 10
          }));
          setFunnelData({
            ...data,
            funnel: enrichedFunnel
          });
        }
        setLoadingFunnel(false);
      })
      .catch(() => {
        setFunnelData(fallbackFunnel);
        setLoadingFunnel(false);
      });
  }, []);

  const currentFunnel = funnelData || fallbackFunnel;

  return (
    <div className="dashboard-root">
      {/* Background Animated Ambient Mesh Orbs */}
      <div className="dashboard-ambient-canvas" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-pill-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Airtel Accel Business • Next-Gen SMB Enablement</span>
        </div>

        <h1 className="hero-main-heading">
          Go digital <span className="gradient-text-red">in one sitting</span>
        </h1>

        <p className="hero-subtitle">
          The smart way to set up your business connectivity, communications, and cloud — all in one place.
          Zero paperwork, automated GSTIN discovery, and live technician tracking to doorstep activation.
        </p>

        <div className="hero-cta-group">
          <Link to="/advisor" className="hero-primary-cta">
            <Bot size={20} />
            <span>Start with AI Advisor</span>
            <ArrowRight size={18} />
          </Link>

          <Link to="/tracker" className="hero-secondary-cta">
            <PackageCheck size={18} />
            <span>Track Existing Order</span>
          </Link>
        </div>

        <div className="hero-trust-chips">
          <div className="hero-trust-chip">
            <CheckCircle2 size={16} color="#22c55e" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <div className="hero-trust-chip">
            <CheckCircle2 size={16} color="#22c55e" />
            <span>Instant Udyam & GSTIN Lookup</span>
          </div>
          <div className="hero-trust-chip">
            <CheckCircle2 size={16} color="#22c55e" />
            <span>99.9% Fiber Uptime SLA</span>
          </div>
          <div className="hero-trust-chip">
            <CheckCircle2 size={16} color="#22c55e" />
            <span>Dedicated Activation Concierge</span>
          </div>
        </div>
      </section>

      {/* STATS CARDS ROW (Animated Counters) */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              <span>{productsCount}</span>
            </div>
            <div className="stat-label">Products Available</div>
            <p className="stat-sub">Broadband, Cloud PBX, CCTV & M365</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              <span>{smbCount.toLocaleString('en-IN')}</span>
              <span className="stat-accent">+</span>
            </div>
            <div className="stat-label">SMBs Served</div>
            <p className="stat-sub">Across 4 major industry segments</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              <span className="stat-accent">&lt;&nbsp;</span>
              <span>{daysCount}</span>
            </div>
            <div className="stat-label">Days to Activate</div>
            <p className="stat-sub">Down from 17.6 days traditional</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              <span>{satisfactionCount}</span>
              <span className="stat-accent">%</span>
            </div>
            <div className="stat-label">Satisfaction</div>
            <p className="stat-sub">Zero paperwork & transparent pricing</p>
          </div>
        </div>
      </section>

      {/* 4 FEATURE CARDS (Linking to each module) */}
      <section className="features-section">
        <div className="section-header-centered">
          <span className="section-tag">Unified Platform</span>
          <h2 className="section-title">Everything your business needs to launch</h2>
          <p className="section-subtitle">
            Four purpose-built engines designed to collapse weeks of enterprise sales cycles into minutes.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1: AI Advisor */}
          <Link to="/advisor" className="feature-card">
            <div className="feature-icon-box">
              <span>🤖</span>
            </div>
            <h3 className="feature-title">AI Advisor</h3>
            <div className="feature-tagline">Get personalized bundle recommendations</div>
            <p className="feature-desc">
              Analyzes your business vertical, team headcount, and multi-site footprint to construct tailored telecom,
              cloud communication, and cybersecurity packages in 90 seconds.
            </p>
            <div className="feature-link-arrow">
              <span>Launch Advisor</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Feature 2: Smart Quote */}
          <Link to="/quote" className="feature-card">
            <div className="feature-icon-box">
              <span>📊</span>
            </div>
            <h3 className="feature-title">Smart Quote</h3>
            <div className="feature-tagline">Transparent pricing, no hidden costs</div>
            <p className="feature-desc">
              Interactive pricing matrix with volume tier discounts, contract term levers, itemized GST breakdowns, and
              instant proforma invoices without sales rep delays.
            </p>
            <div className="feature-link-arrow">
              <span>Build Custom Quote</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Feature 3: Instant KYC */}
          <Link to="/kyc" className="feature-card">
            <div className="feature-icon-box">
              <span>✅</span>
            </div>
            <h3 className="feature-title">Instant KYC</h3>
            <div className="feature-tagline">Verify in minutes, not days</div>
            <p className="feature-desc">
              Zero-document onboarding. Real-time API verification against government GSTIN and Udyam MSME registries
              with instant authorized signatory Aadhaar OTP e-signature.
            </p>
            <div className="feature-link-arrow">
              <span>Explore Instant KYC</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Feature 4: Live Tracker */}
          <Link to="/tracker" className="feature-card">
            <div className="feature-icon-box">
              <span>📦</span>
            </div>
            <h3 className="feature-title">Live Tracker</h3>
            <div className="feature-tagline">Track your order in real-time</div>
            <p className="feature-desc">
              Live status timeline powered by catalogue SLA days. View assigned technician credentials, secure entry OTP,
              hardware dispatch, and scheduled activation slots.
            </p>
            <div className="feature-link-arrow">
              <span>Track Activation</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (4-step process) */}
      <section className="how-it-works-section">
        <div className="how-it-works-card">
          <div className="section-header-centered" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Seamless Journey</span>
            <h2 className="section-title">How It Works: 4 Simple Steps</h2>
            <p className="section-subtitle">
              From business identification to live optical fibre transmission in one frictionless sitting.
            </p>
          </div>

          <div className="process-steps-row">
            {/* Step 1 */}
            <div className="process-step-item">
              <div className="step-num-pill">01</div>
              <h4 className="step-title">AI Needs Advisor</h4>
              <div className="step-time-badge">~ 90 Seconds</div>
              <p className="step-desc">
                Input your company profile, employee count, and primary workflows. Our AI recommends tailored bundles.
              </p>
              <div className="step-connector-arrow">
                <ArrowRight size={20} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="process-step-item">
              <div className="step-num-pill">02</div>
              <h4 className="step-title">Dynamic Smart Quote</h4>
              <div className="step-time-badge">Instant Calculation</div>
              <p className="step-desc">
                Review transparent line items, toggle hardware options, lock in tenure discounts, and generate official proformas.
              </p>
              <div className="step-connector-arrow">
                <ArrowRight size={20} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="process-step-item">
              <div className="step-num-pill">03</div>
              <h4 className="step-title">Instant Digital KYC</h4>
              <div className="step-time-badge">&lt; 2 Minutes</div>
              <p className="step-desc">
                Auto-fill company metadata directly from GSTIN & Udyam databases. Complete verified Aadhaar OTP e-signature.
              </p>
              <div className="step-connector-arrow">
                <ArrowRight size={20} />
              </div>
            </div>

            {/* Step 4 */}
            <div className="process-step-item">
              <div className="step-num-pill">04</div>
              <h4 className="step-title">Doorstep Activation</h4>
              <div className="step-time-badge">&lt; 7 Days SLA</div>
              <p className="step-desc">
                Track assigned senior technician arrival, hardware delivery, signal calibration, and static IP go-live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FUNNEL ANALYTICS SECTION (Loaded from /data/leads_summary.json) */}
      <section className="funnel-section">
        <div className="funnel-container-card">
          <div className="funnel-header-split">
            <div>
              <span className="section-tag">Case Study Proof</span>
              <h2 className="section-title" style={{ margin: '0 0 0.5rem 0' }}>
                SMB Lead Funnel Analytics
              </h2>
              <p className="section-subtitle" style={{ margin: 0, textAlign: 'left' }}>
                Real-world benchmark of 5,000 SMB leads from telecom pilot. Demonstrates why self-serve digital onboarding
                solves traditional drop-offs.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                Sample: <strong>{currentFunnel.total_leads.toLocaleString()} SMBs</strong>
              </span>
            </div>
          </div>

          <div className="funnel-grid-layout">
            {/* Visual Funnel Chart */}
            <div className="funnel-visual-box">
              {currentFunnel.funnel.map((step, idx) => (
                <div key={step.stage} className="funnel-bar-item">
                  <div className="funnel-bar-meta">
                    <span className="funnel-bar-label">
                      <span style={{ color: '#ff4d4f', fontSize: '0.8rem', width: '18px' }}>
                        {idx + 1}.
                      </span>
                      <span>{step.stage}</span>
                    </span>
                    <div className="funnel-bar-counts">
                      <span className="funnel-count-val">{step.count.toLocaleString()}</span>
                      <span className="funnel-rate-badge">{step.rate}%</span>
                    </div>
                  </div>
                  <div className="funnel-progress-track">
                    <div
                      className="funnel-progress-fill"
                      style={{ width: `${Math.max(step.rate, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key Metrics Cards */}
            <div className="funnel-metrics-sidebar">
              <div className="metric-highlight-card">
                <div className="metric-hl-title">Activation Velocity</div>
                <div className="metric-hl-value">
                  {currentFunnel.activated_stats?.avg_days_to_activation || 17.6} Days
                </div>
                <div className="metric-hl-comparison">
                  <TrendingUp size={15} />
                  <span>Targeted &lt; 7 Days via Udyam Digital (60% Faster)</span>
                </div>
                <p className="metric-hl-sub">
                  Self-serve automated dispatch removes manual sales scheduling latency.
                </p>
              </div>

              <div className="metric-highlight-card">
                <div className="metric-hl-title">Average Monthly Bundle Value</div>
                <div className="metric-hl-value">
                  ₹{Number(currentFunnel.activated_stats?.avg_monthly_bundle_value || 12351).toLocaleString('en-IN')}
                </div>
                <p className="metric-hl-sub">
                  Bundled Connectivity + Cloud PBX + Security increases SMB lifetime retention.
                </p>
              </div>

              <div className="metric-highlight-card">
                <div className="metric-hl-title">GSTIN Verification Conversion Impact</div>
                <div className="metric-hl-value" style={{ color: '#4ade80' }}>
                  4.8x Uplift
                </div>
                <div className="metric-hl-comparison">
                  <span>9.6% (With GSTIN) vs 2.0% (Without GSTIN)</span>
                </div>
                <p className="metric-hl-sub">
                  Auto-retrieving GSTIN registry details produces an immediate 380% boost in conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Solved Drop Reasons Pills */}
          <div className="drop-reasons-box">
            <h4 className="drop-reasons-title">
              <ShieldCheck size={18} color="#ED1C24" />
              How Project Udyam Digital Solves the Top Traditional Drop-Offs:
            </h4>
            <div className="drop-pills-wrap">
              <div className="drop-pill-solution">
                <span>❌ "Unreachable after 3 calls" (805)</span>
                <ArrowRight size={12} />
                <strong>Solved: 24/7 Self-Serve AI Advisor</strong>
              </div>
              <div className="drop-pill-solution">
                <span>❌ "Owner had no time for visit" (531)</span>
                <ArrowRight size={12} />
                <strong>Solved: 100% Digital e-KYC in 2 min</strong>
              </div>
              <div className="drop-pill-solution">
                <span>❌ "Quote too complex to understand" (206)</span>
                <ArrowRight size={12} />
                <strong>Solved: Interactive Smart Quote</strong>
              </div>
              <div className="drop-pill-solution">
                <span>❌ "Visit not scheduled by sales" (296)</span>
                <ArrowRight size={12} />
                <strong>Solved: Automated Doorstep Slot Picker</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <h2 className="cta-banner-title">Ready to empower your business?</h2>
          <p className="cta-banner-sub">
            Join thousands of modern enterprises using Airtel Accel Business to configure, verify, and activate their
            digital infrastructure in one sitting.
          </p>
          <Link to="/advisor" className="hero-primary-cta" style={{ display: 'inline-flex' }}>
            <span>Start with AI Advisor</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER SECTION NOTE WITH PRIVACY LINK */}
      <div className="dashboard-footer-bar">
        <div className="footer-bar-inner">
          <div className="footer-bar-left">
            <span className="dpdp-badge">
              <Lock size={12} />
              DPDP Act 2023 Compliant Platform
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Bharti Airtel Limited &bull; Project Udyam Digital &bull; SYNC Hackathon 2026
            </span>
          </div>
          <div className="footer-bar-right">
            <Link to="/privacy" className="footer-bar-privacy-link">
              <ShieldCheck size={14} />
              <span>DPDP Privacy Charter & Data Security</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
