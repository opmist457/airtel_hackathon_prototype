import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import QuoteBuilder from '../components/Quote/QuoteBuilder';
import { ChevronRight, ArrowLeft, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';

/**
 * Parse structured answers from the AdvisorChat into a normalized businessProfile
 */
function parseAnswersToProfile(answers) {
  if (!answers || typeof answers !== 'object') return null;

  // Employee count
  let employees = 5;
  if (answers.employeeCount) {
    if (answers.employeeCount.includes('1-5')) employees = 3;
    else if (answers.employeeCount.includes('6-15')) employees = 10;
    else if (answers.employeeCount.includes('16-50')) employees = 25;
    else if (answers.employeeCount.includes('50+')) employees = 55;
    else employees = parseInt(answers.employeeCount, 10) || 5;
  }

  // Sites count
  let sites = 1;
  if (answers.locations) {
    if (answers.locations.includes('2-5')) sites = 3;
    else if (answers.locations.includes('6-10')) sites = 7;
    else if (answers.locations.includes('10+')) sites = 12;
    else sites = parseInt(answers.locations, 10) || 1;
  }

  // City Tier
  let city_tier = '1';
  if (answers.cityTier) {
    if (answers.cityTier.includes('Tier 2')) city_tier = '2';
    else if (answers.cityTier.includes('Tier 1')) city_tier = '1';
  }

  // GSTIN
  const has_gstin = answers.hasGstin === 'Yes' || answers.hasGstin === true;

  // Monthly Budget / Spend
  let currentSpend = 4500;
  if (answers.budget) {
    if (answers.budget.includes('Under ₹1,000')) currentSpend = 999;
    else if (answers.budget.includes('₹1,000-3,000')) currentSpend = 2500;
    else if (answers.budget.includes('₹3,000-10,000')) currentSpend = 6500;
    else if (answers.budget.includes('₹10,000+')) currentSpend = 15000;
  }

  return {
    enterprise_name: answers.businessType ? `${answers.businessType} Enterprise` : 'Registered MSME Enterprise',
    enterprise_type: answers.businessType || 'Micro & Small Business',
    city_tier,
    employees,
    sites,
    has_gstin,
    gstin: has_gstin ? '32TTNXB7384T1ZW' : null,
    currentSpend,
    currentInternet: answers.currentInternet || 'Business broadband',
  };
}

/**
 * QuotePage - Page wrapper that reads any state passed from the Advisor page
 * and renders the interactive QuoteBuilder bundle configurator.
 * 
 * If no state is passed, it displays all 25 products with the flexible starter selection.
 */
export default function QuotePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read state passed from Advisor page (or router navigation)
  const state = location.state || {};

  // Extract recommended products (array of product IDs or product objects)
  const recommendedProducts = useMemo(() => {
    // 1. Direct array of recommended products from state
    if (state.recommendedProducts && Array.isArray(state.recommendedProducts)) {
      return state.recommendedProducts;
    }
    if (state.recommendedProductIds && Array.isArray(state.recommendedProductIds)) {
      return state.recommendedProductIds;
    }
    if (state.recommended && Array.isArray(state.recommended)) {
      return state.recommended;
    }

    // 2. From Advisor bundle recommendation object
    const recObj = state.recommendation || state.bundleResult;
    if (recObj && Array.isArray(recObj.products)) {
      return recObj.products.map((p) => p.id || p.product_id);
    }

    // 3. From storage fallback if user refreshed on /quote
    try {
      const stored = sessionStorage.getItem('udyam_recommendation') || localStorage.getItem('udyam_recommendation');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed?.products)) {
          return parsed.products.map((p) => p.id || p.product_id);
        }
      }
    } catch {
      // Ignore storage parse error
    }

    // If no state passed, return null so QuoteBuilder shows all products cleanly
    return null;
  }, [state]);

  // Extract business profile from state or answers
  const businessProfile = useMemo(() => {
    // 1. Explicit profile passed in state
    if (state.businessProfile || state.business || state.profile || state.lead) {
      return state.businessProfile || state.business || state.profile || state.lead;
    }

    // 2. Parsed from Advisor answers
    if (state.answers) {
      return parseAnswersToProfile(state.answers);
    }

    // 3. From storage fallback
    try {
      const storedAnswers = sessionStorage.getItem('udyam_answers') || localStorage.getItem('udyam_answers');
      if (storedAnswers) {
        const parsedAnswers = JSON.parse(storedAnswers);
        const profile = parseAnswersToProfile(parsedAnswers);
        if (profile) return profile;
      }
    } catch {
      // Ignore
    }

    // Fallback default MSME profile
    return null;
  }, [state]);

  const handleProceedToKyc = (quotePayload) => {
    // Save to session for persistence
    try {
      sessionStorage.setItem('udyam_quote', JSON.stringify(quotePayload));
    } catch (e) {
      console.warn('Could not store quote payload:', e);
    }

    // Navigate to /kyc route with enriched state
    navigate('/kyc', {
      state: {
        ...quotePayload,
        fromQuote: true,
      },
    });
  };

  return (
    <div className="quote-page-root" style={{ minHeight: '100vh', background: '#0B0E17' }}>
      {/* Top Breadcrumb & Navigation Bar */}
      <nav
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 14, 23, 0.88)',
          backdropFilter: 'blur(16px)',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Breadcrumb Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Link
              to="/advisor"
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={14} />
              Advisor Assessment
            </Link>
            <ChevronRight size={14} color="#64748B" />
            <span
              style={{
                color: '#F8FAFC',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={13} color="var(--airtel-red, #ED1C24)" />
              2. Quote & Bundle Builder
            </span>
            <ChevronRight size={14} color="#64748B" />
            <span style={{ color: '#64748B', fontWeight: 500 }}>
              3. Paperless KYC
            </span>
          </div>

          {/* Airtel Enterprise Helpline / Support indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 12,
              color: '#94A3B8',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#10B981" />
              100% Digital SLA & GST Invoicing
            </span>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                alert('Airtel Enterprise Care: Call 1800-103-4444 or email enterprise@airtel.com');
              }}
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <HelpCircle size={14} />
              Help
            </a>
          </div>
        </div>
      </nav>

      {/* Main Quote Builder Component */}
      <main>
        <QuoteBuilder
          recommendedProducts={recommendedProducts}
          businessProfile={businessProfile}
          onProceedToKyc={handleProceedToKyc}
        />
      </main>
    </div>
  );
}
