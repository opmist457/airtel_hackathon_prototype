import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Sparkles,
  Calculator,
  ShieldCheck,
  Activity,
  Menu,
  X,
  ExternalLink,
  Lock,
  CheckCircle2,
  ChevronRight,
  FileCode2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Scroll to top on route change & close mobile menu
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Navbar scroll listener for enhanced glassmorphism elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'AI Advisor', path: '/advisor', icon: Sparkles },
    { name: 'Quote', path: '/quote', icon: Calculator },
    { name: 'KYC', path: '/kyc', icon: ShieldCheck },
    { name: 'Tracker', path: '/tracker', icon: Activity }
  ];

  return (
    <div className="layout-container">
      {/* Subtle Animated Background: Cyber Mesh & Glowing Orbs */}
      <div className="layout-bg-mesh" aria-hidden="true">
        <div className="layout-bg-grid" />
        <div className="layout-orb layout-orb-1" />
        <div className="layout-orb layout-orb-2" />
        <div className="layout-orb layout-orb-3" />
      </div>

      {/* Fixed / Sticky Top Navbar */}
      <header className={`navbar-wrapper ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-top-accent" />
        <div className="navbar-inner">
          {/* Logo & Branding */}
          <Link to="/" className="navbar-brand" aria-label="Accel Business Home">
            <div className="navbar-logo-badge">
              <span className="navbar-logo-symbol">A</span>
            </div>
            <div className="navbar-brand-text">
              <span className="navbar-logo-title">
                Accel Business<span className="navbar-logo-dot" />
              </span>
              <span className="navbar-logo-subtitle">Project Udyam Digital</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav" aria-label="Main Navigation">
            <ul className="nav-menu-desktop">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path} className="nav-item">
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        isActive ? 'nav-link nav-link-active active' : 'nav-link'
                      }
                    >
                      <span className="nav-link-icon">
                        <IconComponent size={16} />
                      </span>
                      <span className="nav-link-label">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Navbar Right Actions */}
          <div className="navbar-actions">
            <div className="navbar-badge-status" title="Instant Automated Verification Engine">
              <span className="navbar-status-led" />
              <span>Airtel 5G Core Live</span>
            </div>

            <NavLink to="/advisor" className="navbar-cta-btn">
              <Sparkles size={14} />
              <span>Get AI Recommendation</span>
            </NavLink>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className={`navbar-hamburger ${mobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="navbar-hamburger-line" />
              <span className="navbar-hamburger-line" />
              <span className="navbar-hamburger-line" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Glassmorphism */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <ul className="navbar-mobile-nav">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path} className="nav-mobile-item">
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        isActive ? 'nav-link nav-link-active active' : 'nav-link'
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        <IconComponent size={18} />
                        <span>{item.name}</span>
                      </span>
                      <ChevronRight size={16} opacity={0.6} />
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            <div className="navbar-mobile-footer">
              <div className="navbar-badge-status" style={{ justifyContent: 'center' }}>
                <span className="navbar-status-led" />
                <span>Airtel 5G Core Live • DPDP Ready</span>
              </div>
              <NavLink
                to="/quote"
                className="btn-primary"
                style={{ width: '100%', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Instant MSME Quote
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="layout-main" id="main-content">
        <div className="layout-content">
          {children || <Outlet />}
        </div>
      </main>

      {/* Global Application Footer */}
      <footer className="layout-footer">
        <div className="layout-footer-inner">
          <div className="layout-footer-grid">
            {/* Brand Column */}
            <div className="layout-footer-brand-col">
              <div className="navbar-brand">
                <div className="navbar-logo-badge">
                  <span className="navbar-logo-symbol">A</span>
                </div>
                <div className="navbar-brand-text">
                  <span className="navbar-logo-title">
                    Accel Business<span className="navbar-logo-dot" />
                  </span>
                  <span className="navbar-logo-subtitle">Project Udyam Digital</span>
                </div>
              </div>
              <p className="layout-footer-desc">
                Intelligent MSME digital onboarding & automated telecom bundling. 
                Built for the Airtel SYNC Hackathon 2026 to compress 17-day onboarding 
                cycles into 10 minutes with DPDP 2023 compliance.
              </p>
              <div className="layout-footer-tagline">
                <Cpu size={14} />
                <span>Powered by Airtel SYNC Open APIs & AI Advisor</span>
              </div>
            </div>

            {/* Platform Quick Links */}
            <div className="layout-footer-col">
              <h4 className="layout-footer-title">Platform</h4>
              <ul className="layout-footer-links">
                <li>
                  <Link to="/" className="layout-footer-link">Home Dashboard</Link>
                </li>
                <li>
                  <Link to="/advisor" className="layout-footer-link">AI Needs Advisor</Link>
                </li>
                <li>
                  <Link to="/quote" className="layout-footer-link">Instant Quote Engine</Link>
                </li>
                <li>
                  <Link to="/kyc" className="layout-footer-link">Smart KYC Verification</Link>
                </li>
                <li>
                  <Link to="/tracker" className="layout-footer-link">Order Status Tracker</Link>
                </li>
              </ul>
            </div>

            {/* Hackathon Docs & Governance */}
            <div className="layout-footer-col">
              <h4 className="layout-footer-title">Documentation</h4>
              <ul className="layout-footer-links">
                <li>
                  <Link to="/privacy" className="layout-footer-link accent-red">
                    <Lock size={14} />
                    <span>Privacy Note</span>
                    <span className="layout-footer-badge">DPDP</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="/docs/architecture.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="layout-footer-link"
                    title="Open Technical Architecture Document"
                  >
                    <FileCode2 size={14} />
                    <span>Architecture</span>
                    <ExternalLink size={12} opacity={0.7} />
                  </a>
                </li>
                <li>
                  <a
                    href="/docs/business_case.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="layout-footer-link"
                    title="Open Business Case & ROI Analysis"
                  >
                    <TrendingUp size={14} />
                    <span>Business Case</span>
                    <ExternalLink size={12} opacity={0.7} />
                  </a>
                </li>
                <li>
                  <Link to="/architecture" className="layout-footer-link" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Architecture Route
                  </Link>
                </li>
                <li>
                  <Link to="/business-case" className="layout-footer-link" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Business Case Route
                  </Link>
                </li>
              </ul>
            </div>

            {/* Security & Compliance Card */}
            <div className="layout-footer-col">
              <h4 className="layout-footer-title">Security & Trust</h4>
              <div className="layout-footer-trust-box">
                <div className="layout-footer-trust-item">
                  <CheckCircle2 size={16} className="layout-footer-trust-icon" />
                  <div>
                    <strong>DPDP Act 2023 Compliant</strong>
                    <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                      Purpose-limited collection, Aadhaar/PAN tokenization & auto-purge.
                    </p>
                  </div>
                </div>
                <div className="layout-footer-trust-item">
                  <CheckCircle2 size={16} className="layout-footer-trust-icon" />
                  <div>
                    <strong>Automated Registry Sync</strong>
                    <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                      Instant verification against GSTIN & Udyam national databases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="layout-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} Accel Business &bull; Airtel SYNC Hackathon 2026. All rights reserved.
            </div>
            <div className="layout-footer-meta">
              <Link to="/privacy">Privacy Notice</Link>
              <span>&bull;</span>
              <a href="/docs/architecture.html" target="_blank" rel="noopener noreferrer">System Architecture</a>
              <span>&bull;</span>
              <a href="/docs/business_case.html" target="_blank" rel="noopener noreferrer">Financial Model</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
