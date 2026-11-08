import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Wifi,
  PhoneCall,
  Cloud,
  ShieldCheck,
  Cpu,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Building2,
  MapPin,
  Users,
  CreditCard,
  CheckCircle2,
  Info,
  Search,
  RotateCcw,
  Check,
  ShieldAlert,
} from 'lucide-react';

import {
  formatINR,
  formatDuration,
  calculateSavings,
  checkProductEligibility,
  checkDependencies,
} from '../../utils/helpers';
import './QuoteBuilder.css';

// Canonical category ordering with descriptions & icons
const CATEGORY_CONFIG = {
  Connectivity: {
    icon: Wifi,
    description: 'High-speed business fibre, 5G AirFiber, leased lines & failover',
    shortName: 'Connectivity',
  },
  Communication: {
    icon: PhoneCall,
    description: 'Cloud telephony, toll-free lines, business SMS & WhatsApp API',
    shortName: 'Communication',
  },
  'Cloud & Productivity': {
    icon: Cloud,
    description: 'Email suites, cloud storage, custom domain & smart billing POS',
    shortName: 'Cloud & Office',
  },
  Security: {
    icon: ShieldCheck,
    description: 'Managed firewalls, endpoint protection & secure enterprise Wi-Fi',
    shortName: 'Security',
  },
  'IoT & Physical': {
    icon: Cpu,
    description: 'Cloud CCTV surveillance, industrial machine sensors & fleet tracking',
    shortName: 'IoT & Physical',
  },
};

const DEFAULT_RECOMMENDED_IDS = ['P01', 'P07', 'P16', 'P20'];

/**
 * Determine sensible initial quantity for a product given business profile
 */
function getInitialQuantity(product, profile) {
  const unit = (product?.unit || '').toLowerCase();
  const emp = Number(profile?.employees || profile?.employee_count || 5);
  const sites = Number(profile?.sites || profile?.site_count || 1);

  if (unit.includes('site')) return Math.max(product.min_sites || 1, sites);
  if (unit.includes('line') || unit.includes('user')) return Math.max(product.min_employees || 1, Math.min(emp, 5));
  if (unit.includes('device')) return 3;
  if (unit.includes('camera')) return 2;
  if (unit.includes('vehicle')) return 2;
  if (unit.includes('channel')) return 2;
  return 1;
}

export default function QuoteBuilder({
  recommendedProducts: propRecommended,
  businessProfile: propProfile,
  onProceedToKyc,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State passed from Advisor via router or URL query
  const locationState = location?.state || {};

  // Resolve business profile
  const businessProfile = useMemo(() => {
    return (
      propProfile ||
      locationState.businessProfile || {
        enterprise_name: 'Balaji Dental Care LLP',
        enterprise_type: 'Micro Services',
        city: 'Kochi',
        state: 'Kerala',
        city_tier: '2',
        employees: 5,
        sites: 1,
        gstin: '32TTNXB7384T1ZW',
        has_gstin: true,
        currentSpend: 4500,
        segment: 'micro',
      }
    );
  }, [propProfile, locationState.businessProfile]);

  // Catalog State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Selection State
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [quantities, setQuantities] = useState({});

  // Filter & Search Controls
  const [activeCategory, setActiveCategory] = useState('all');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Current Spend for Comparison
  const initialSpend =
    businessProfile?.currentSpend ||
    businessProfile?.current_spend ||
    locationState?.currentSpend ||
    Number(searchParams.get('spend')) ||
    4500;
  const [currentSpend, setCurrentSpend] = useState(initialSpend);
  const [isEditingSpend, setIsEditingSpend] = useState(false);
  const [spendInputVal, setSpendInputVal] = useState(String(initialSpend));

  // Resolved list of recommended IDs (from prop, router state, or URL param)
  const initialRecommendedIds = useMemo(() => {
    if (propRecommended) {
      return Array.isArray(propRecommended)
        ? propRecommended.map((item) => (typeof item === 'string' ? item : item.product_id))
        : [];
    }
    if (locationState.recommendedProducts) {
      return Array.isArray(locationState.recommendedProducts)
        ? locationState.recommendedProducts.map((item) =>
            typeof item === 'string' ? item : item.product_id
          )
        : [];
    }
    const queryRec = searchParams.get('recommended');
    if (queryRec) {
      return queryRec.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return DEFAULT_RECOMMENDED_IDS;
  }, [propRecommended, locationState.recommendedProducts, searchParams]);

  // Fetch products from /data/products.json
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/data/products.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load catalog: HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
        setLoading(false);

        // Pre-select recommended items
        const initialSet = new Set();
        const initialQty = {};

        data.forEach((prod) => {
          if (initialRecommendedIds.includes(prod.product_id)) {
            // Only auto-select if eligible
            const { eligible } = checkProductEligibility(prod, businessProfile);
            if (eligible) {
              initialSet.add(prod.product_id);
              initialQty[prod.product_id] = getInitialQuantity(prod, businessProfile);
            }
          }
        });

        // If no products matched recommendations, select default Biz Fibre 100
        if (initialSet.size === 0 && data.length > 0) {
          initialSet.add(data[0].product_id);
          initialQty[data[0].product_id] = 1;
        }

        setSelectedProductIds(initialSet);
        setQuantities(initialQty);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching products:', err);
        setError(err.message || 'Could not load product catalog');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialRecommendedIds, businessProfile]);

  // Map of products for fast lookup
  const productsMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.product_id, p));
    return map;
  }, [products]);

  // Toggle product selection
  const handleToggleProduct = useCallback((productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    setQuantities((prev) => {
      if (!prev[productId]) {
        const prod = productsMap.get(productId);
        return {
          ...prev,
          [productId]: getInitialQuantity(prod, businessProfile),
        };
      }
      return prev;
    });
  }, [productsMap, businessProfile]);

  // Adjust quantity
  const handleQuantityChange = useCallback((productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  }, []);

  const handleQuantityDirectInput = useCallback((productId, value) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(num) || num < 1 ? 1 : Math.min(num, 999),
    }));
  }, []);

  // Quick Action: Add a prerequisite broadband product
  const handleAddDependencyPrereq = useCallback((prereqId) => {
    setSelectedProductIds((prev) => new Set([...prev, prereqId]));
    setQuantities((prev) => {
      if (!prev[prereqId]) {
        const prod = productsMap.get(prereqId);
        return { ...prev, [prereqId]: getInitialQuantity(prod, businessProfile) };
      }
      return prev;
    });
  }, [productsMap, businessProfile]);

  // Reset to initial recommendations
  const handleResetToRecommended = useCallback(() => {
    const recSet = new Set();
    const newQty = {};
    products.forEach((prod) => {
      if (initialRecommendedIds.includes(prod.product_id)) {
        const { eligible } = checkProductEligibility(prod, businessProfile);
        if (eligible) {
          recSet.add(prod.product_id);
          newQty[prod.product_id] = getInitialQuantity(prod, businessProfile);
        }
      }
    });
    setSelectedProductIds(recSet);
    setQuantities(newQty);
  }, [products, initialRecommendedIds, businessProfile]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setSelectedProductIds(new Set());
  }, []);

  // Check unmet dependencies
  const unmetDependencies = useMemo(() => {
    return checkDependencies(Array.from(selectedProductIds), products);
  }, [selectedProductIds, products]);

  // Calculate Real-Time Pricing
  const {
    monthlyTotal,
    setupTotal,
    maxContractMonths,
    selectedItemsList,
    gstEstimate,
    grandTotalMonthly,
  } = useMemo(() => {
    let monthly = 0;
    let setup = 0;
    let maxContract = 0;
    const items = [];

    selectedProductIds.forEach((id) => {
      const prod = productsMap.get(id);
      if (!prod) return;

      const qty = quantities[id] || 1;
      const lineMonthly = (prod.price_min_inr_per_month || 0) * qty;

      // Setup fee logic: if per site or counter, multiply by qty, otherwise flat product setup
      const isPerUnitSetup =
        (prod.unit || '').includes('site') ||
        (prod.unit || '').includes('counter') ||
        (prod.unit || '').includes('device') ||
        (prod.unit || '').includes('camera');
      const lineSetup = (prod.one_time_setup_inr || 0) * (isPerUnitSetup ? qty : 1);

      monthly += lineMonthly;
      setup += lineSetup;

      if ((prod.min_contract_months || 0) > maxContract) {
        maxContract = prod.min_contract_months;
      }

      items.push({
        ...prod,
        quantity: qty,
        lineMonthly,
        lineSetup,
      });
    });

    const gst = Math.round(monthly * 0.18);

    return {
      monthlyTotal: monthly,
      setupTotal: setup,
      maxContractMonths: maxContract,
      selectedItemsList: items,
      gstEstimate: gst,
      grandTotalMonthly: monthly + gst,
    };
  }, [selectedProductIds, quantities, productsMap]);

  // Savings comparison
  const savings = useMemo(() => {
    return calculateSavings(currentSpend, monthlyTotal);
  }, [currentSpend, monthlyTotal]);

  // Filtered and Grouped Products
  const groupedProducts = useMemo(() => {
    const groups = {};

    Object.keys(CATEGORY_CONFIG).forEach((cat) => {
      groups[cat] = [];
    });

    products.forEach((prod) => {
      // Category filter
      if (activeCategory !== 'all' && prod.category !== activeCategory) {
        return;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.product_name.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        const matchesCategory = prod.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return;
      }

      // Eligibility filter
      const eligibility = checkProductEligibility(prod, businessProfile);
      if (eligibleOnly && !eligibility.eligible) {
        return;
      }

      if (!groups[prod.category]) {
        groups[prod.category] = [];
      }
      groups[prod.category].push({
        ...prod,
        eligibility,
        isRecommended: initialRecommendedIds.includes(prod.product_id),
      });
    });

    return groups;
  }, [products, activeCategory, searchQuery, eligibleOnly, businessProfile, initialRecommendedIds]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    const selectedCounts = {};

    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      if (selectedProductIds.has(p.product_id)) {
        selectedCounts[p.category] = (selectedCounts[p.category] || 0) + 1;
      }
    });

    return { counts, selectedCounts };
  }, [products, selectedProductIds]);

  // Handle Proceed to KYC
  const handleProceedToKyc = useCallback(() => {
    const quotePayload = {
      selectedProducts: selectedItemsList,
      selectedProductIds: Array.from(selectedProductIds),
      quantities,
      monthlyTotal,
      setupTotal,
      maxContractMonths,
      gstEstimate,
      grandTotalMonthly,
      businessProfile,
      currentSpend,
      savings,
      hasDependencyWarnings: unmetDependencies.length > 0,
      timestamp: new Date().toISOString(),
    };

    if (onProceedToKyc) {
      onProceedToKyc(quotePayload);
      return;
    }

    // Default router navigation to /kyc
    navigate('/kyc', {
      state: quotePayload,
    });
  }, [
    selectedItemsList,
    selectedProductIds,
    quantities,
    monthlyTotal,
    setupTotal,
    maxContractMonths,
    gstEstimate,
    grandTotalMonthly,
    businessProfile,
    currentSpend,
    savings,
    unmetDependencies,
    onProceedToKyc,
    navigate,
  ]);

  if (loading) {
    return (
      <div className="quote-container">
        <div className="quote-loading-state">
          <div className="quote-spinner"></div>
          <h2 style={{ color: '#fff', margin: '0 0 8px' }}>Configuring Your Airtel Digital Bundle...</h2>
          <p style={{ color: 'var(--qd-text-secondary)', margin: 0 }}>
            Fetching enterprise products, verifying Udyam eligibility & pricing matrices.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quote-container">
        <div className="quote-error-state">
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#fff', margin: '0 0 8px' }}>Unable to Load Products</h2>
          <p style={{ color: 'var(--qd-text-secondary)', marginBottom: 20 }}>{error}</p>
          <button
            className="summary-empty-btn"
            onClick={() => window.location.reload()}
          >
            Retry Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-container">
      <div className="quote-inner-wrap">
        {/* ==========================================================
            HEADER & BUSINESS PROFILE
            ========================================================== */}
        <header className="quote-header">
          <div className="quote-header-top">
            <div className="quote-brand-badge">
              <span className="quote-brand-dot"></span>
              Airtel Udyam Digital • Interactive Bundle Builder
            </div>
            <div className="quote-header-actions">
              <button
                className="category-pill"
                onClick={handleResetToRecommended}
                title="Restore Airtel Advisor recommended bundle"
              >
                <RotateCcw size={14} />
                Recommended ({initialRecommendedIds.length})
              </button>
              {selectedProductIds.size > 0 && (
                <button
                  className="category-pill"
                  onClick={handleClearAll}
                  style={{ color: '#94a3b8' }}
                >
                  <Trash2 size={14} />
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <h1 className="quote-title">
            Tailor Your <span>Enterprise Bundle</span>
          </h1>
          <p className="quote-subtitle">
            Configure connectivity, communications, cloud tools, and smart security with instant
            volume discounts, SLA guarantees, and transparent zero-hidden-fee pricing.
          </p>

          {/* Business Profile Meta Banner */}
          {businessProfile && (
            <div className="quote-business-banner">
              <div className="quote-business-meta">
                <div className="quote-business-avatar">
                  {businessProfile.enterprise_name
                    ? businessProfile.enterprise_name.charAt(0)
                    : 'U'}
                </div>
                <div className="quote-business-info">
                  <h3>{businessProfile.enterprise_name || 'Registered MSME Enterprise'}</h3>
                  <div className="quote-business-tags">
                    {businessProfile.enterprise_type && (
                      <span className="quote-tag">
                        <Building2 size={12} />
                        {businessProfile.enterprise_type}
                      </span>
                    )}
                    {businessProfile.city && (
                      <span className="quote-tag">
                        <MapPin size={12} />
                        {businessProfile.city}
                        {businessProfile.city_tier && ` (Tier ${businessProfile.city_tier})`}
                      </span>
                    )}
                    {businessProfile.employees && (
                      <span className="quote-tag">
                        <Users size={12} />
                        {businessProfile.employees} Team Members
                      </span>
                    )}
                    {businessProfile.gstin ? (
                      <span className="quote-tag quote-tag-green">
                        <Check size={12} />
                        GSTIN Verified: {businessProfile.gstin.slice(0, 5)}...{businessProfile.gstin.slice(-3)}
                      </span>
                    ) : (
                      <span className="quote-tag quote-tag-amber">
                        <AlertTriangle size={12} />
                        No GSTIN Registered
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Spend comparison pill */}
              <div className="quote-comparison-strip" style={{ margin: 0, padding: '10px 16px' }}>
                <div className="quote-comparison-left">
                  <span className="quote-comparison-badge">Comparison</span>
                  <div className="quote-comparison-text">
                    {isEditingSpend ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>Current Spend: ₹</span>
                        <input
                          type="number"
                          className="category-search-input"
                          style={{ width: 90, padding: '2px 6px' }}
                          value={spendInputVal}
                          onChange={(e) => setSpendInputVal(e.target.value)}
                          onBlur={() => {
                            setCurrentSpend(Number(spendInputVal) || 0);
                            setIsEditingSpend(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setCurrentSpend(Number(spendInputVal) || 0);
                              setIsEditingSpend(false);
                            }
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        Current Spend: <span className="quote-comparison-spend-val">{formatINR(currentSpend)}</span>
                        → New Bundle: <span className="quote-comparison-new-val">{formatINR(monthlyTotal)}/mo</span>
                      </>
                    )}
                  </div>
                </div>

                {savings.isCheaper && savings.difference > 0 ? (
                  <div className="quote-comparison-savings">
                    <Sparkles size={14} />
                    Save {formatINR(savings.difference)}/mo ({savings.percentage}% lower)
                  </div>
                ) : savings.isMore ? (
                  <div
                    className="quote-tag"
                    style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
                  >
                    Enterprise Grade & 99.9% SLA
                  </div>
                ) : null}

                {!isEditingSpend && (
                  <button
                    className="quote-spend-input-btn"
                    onClick={() => {
                      setSpendInputVal(String(currentSpend));
                      setIsEditingSpend(true);
                    }}
                  >
                    Edit Spend
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ==========================================================
            CATEGORY NAVIGATION & FILTER BAR
            ========================================================== */}
        <div className="category-filter-bar">
          <div className="category-nav-pills">
            <button
              className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Products
              <span className="category-pill-count">{categoryCounts.counts.all || 0}</span>
              {selectedProductIds.size > 0 && (
                <span className="category-pill-selected-count">
                  {selectedProductIds.size}
                </span>
              )}
            </button>

            {Object.keys(CATEGORY_CONFIG).map((catName) => {
              const cfg = CATEGORY_CONFIG[catName];
              const Icon = cfg.icon;
              const totalInCat = categoryCounts.counts[catName] || 0;
              const selectedInCat = categoryCounts.selectedCounts[catName] || 0;

              return (
                <button
                  key={catName}
                  className={`category-pill ${activeCategory === catName ? 'active' : ''}`}
                  onClick={() => setActiveCategory(catName)}
                >
                  <Icon size={14} />
                  {cfg.shortName}
                  <span className="category-pill-count">{totalInCat}</span>
                  {selectedInCat > 0 && (
                    <span className="category-pill-selected-count">{selectedInCat}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="category-filter-actions">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                className="category-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <label className="category-toggle-label">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                style={{ accentColor: 'var(--airtel-red)', cursor: 'pointer' }}
              />
              Eligible only
            </label>
          </div>
        </div>

        {/* ==========================================================
            LAYOUT: PRODUCTS CATALOG + STICKY SUMMARY SIDEBAR
            ========================================================== */}
        <div className="quote-layout">
          {/* LEFT: Products grouped by Category */}
          <div className="quote-products-column">
            {Object.entries(groupedProducts).map(([categoryName, prods]) => {
              if (prods.length === 0) return null;
              const cfg = CATEGORY_CONFIG[categoryName] || {
                icon: Wifi,
                description: '',
              };
              const CatIcon = cfg.icon;

              return (
                <section
                  key={categoryName}
                  id={`cat-${categoryName.replace(/\s+/g, '-').toLowerCase()}`}
                  className="quote-category-section"
                >
                  <div className="category-section-header">
                    <div className="category-section-title-wrap">
                      <div className="category-section-icon">
                        <CatIcon size={18} />
                      </div>
                      <div>
                        <h2 className="category-section-title">{categoryName}</h2>
                        <p className="category-section-desc">{cfg.description}</p>
                      </div>
                    </div>
                    <span className="category-section-badge">
                      {prods.length} {prods.length === 1 ? 'solution' : 'solutions'}
                    </span>
                  </div>

                  <div className="quote-products-grid">
                    {prods.map((product) => {
                      const isSelected = selectedProductIds.has(product.product_id);
                      const qty = quantities[product.product_id] || 1;
                      const { eligible, reason: ineligibilityReason } = product.eligibility;

                      // Check if this specific product has unmet requirements
                      const unmetForThis = unmetDependencies.find(
                        (u) => u.productId === product.product_id
                      );

                      const needsGstinAlert =
                        product.requires_gstin === 'Y' && !businessProfile?.has_gstin && !businessProfile?.gstin;

                      return (
                        <div
                          key={product.product_id}
                          className={`product-card ${isSelected ? 'selected' : ''} ${
                            !eligible ? 'ineligible' : ''
                          } ${!product.isRecommended ? 'no-rec' : ''}`}
                        >
                          {/* Recommended pill badge */}
                          {product.isRecommended && (
                            <div className="product-card-rec-pill">
                              <Sparkles size={11} />
                              Recommended
                            </div>
                          )}

                          <div>
                            <div className="product-card-top">
                              <div className="product-card-header">
                                <h3 className="product-card-title">{product.product_name}</h3>
                                <div className="product-card-badges">
                                  {product.requires_gstin === 'Y' && (
                                    <span
                                      className="product-card-badge product-card-badge-gstin"
                                      data-tooltip="Requires registered GSTIN for B2B billing"
                                    >
                                      GSTIN Required
                                    </span>
                                  )}
                                  {product.typical_install_days && (
                                    <span className="product-card-badge product-card-badge-install">
                                      ~{product.typical_install_days}d setup
                                    </span>
                                  )}
                                  {!eligible && (
                                    <span
                                      className="product-card-badge product-card-badge-ineligible"
                                      data-tooltip={ineligibilityReason}
                                    >
                                      <Info size={11} /> Not Eligible
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Selection Toggle Switch */}
                              <label
                                className="product-card-toggle"
                                data-tooltip={!eligible ? ineligibilityReason : isSelected ? 'Remove from bundle' : 'Add to bundle'}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!eligible}
                                  onChange={() => handleToggleProduct(product.product_id)}
                                />
                                <span className="product-card-toggle-slider"></span>
                              </label>
                            </div>

                            <p className="product-card-desc">{product.description}</p>

                            {/* Ineligible reason notice */}
                            {!eligible && ineligibilityReason && (
                              <div className="product-card-ineligible-banner">
                                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>{ineligibilityReason}</span>
                              </div>
                            )}

                            {/* GSTIN missing warning */}
                            {isSelected && needsGstinAlert && (
                              <div
                                className="product-card-ineligible-banner"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  borderColor: 'rgba(245, 158, 11, 0.4)',
                                  color: '#fde68a',
                                }}
                              >
                                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>GSTIN is mandatory for B2B activation. Please have it ready for KYC.</span>
                              </div>
                            )}

                            {/* Dependency warning on card */}
                            {isSelected && unmetForThis && (
                              <div className="product-card-dep-banner">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <AlertTriangle size={13} color="#f59e0b" />
                                  <strong>Broadband Requirement Missing</strong>
                                </div>
                                <span>Requires active Airtel Biz Fibre or Leased Line connection.</span>
                                {unmetForThis.missingOptions?.length > 0 && (
                                  <button
                                    className="product-card-dep-action"
                                    onClick={() => handleAddDependencyPrereq(unmetForThis.missingOptions[0].id)}
                                  >
                                    + Add {unmetForThis.missingOptions[0].name} ({formatINR(productsMap.get(unmetForThis.missingOptions[0].id)?.price_min_inr_per_month)}/mo)
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Pricing & Terms Matrix */}
                            <div className="product-card-meta-grid">
                              <div className="product-card-meta-item">
                                <span className="product-card-meta-label">Unit</span>
                                <span className="product-card-meta-val">{product.unit || 'per site'}</span>
                              </div>
                              <div className="product-card-meta-item">
                                <span className="product-card-meta-label">Setup Fee</span>
                                <span
                                  className={`product-card-meta-val ${
                                    product.one_time_setup_inr === 0 ? 'product-card-meta-val-free' : ''
                                  }`}
                                >
                                  {product.one_time_setup_inr === 0
                                    ? 'FREE'
                                    : formatINR(product.one_time_setup_inr)}
                                </span>
                              </div>
                              <div className="product-card-meta-item">
                                <span className="product-card-meta-label">Contract</span>
                                <span className="product-card-meta-val">
                                  {formatDuration(product.min_contract_months)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom: Monthly Price & Quantity Stepper */}
                          <div>
                            <div className="product-card-bottom">
                              <div className="product-card-price-block">
                                <div className="product-card-price-main">
                                  {formatINR(product.price_min_inr_per_month)}
                                  <span> / mo</span>
                                </div>
                                {product.price_max_inr_per_month &&
                                  product.price_max_inr_per_month !== product.price_min_inr_per_month && (
                                    <span className="product-card-price-range">
                                      Tier range up to {formatINR(product.price_max_inr_per_month)}/mo
                                    </span>
                                  )}
                              </div>

                              <button
                                className={`category-pill ${isSelected ? 'active' : ''}`}
                                style={{
                                  padding: '6px 14px',
                                  fontSize: 12,
                                  cursor: eligible ? 'pointer' : 'not-allowed',
                                }}
                                disabled={!eligible}
                                onClick={() => handleToggleProduct(product.product_id)}
                              >
                                {isSelected ? (
                                  <>
                                    <Check size={13} /> Selected
                                  </>
                                ) : (
                                  <>
                                    <Plus size={13} /> Add Item
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Quantity Selector: Animated on Selection */}
                            {isSelected && (
                              <div className="product-card-qty-row">
                                <div className="product-card-qty-label">
                                  Quantity ({' '}
                                  <span className="product-card-qty-unit">{product.unit}</span> ):
                                </div>
                                <div className="product-card-qty-controls">
                                  <button
                                    className="product-card-qty-btn"
                                    onClick={() => handleQuantityChange(product.product_id, -1)}
                                    disabled={qty <= 1}
                                    title="Decrease quantity"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    className="product-card-qty-input"
                                    value={qty}
                                    onChange={(e) =>
                                      handleQuantityDirectInput(product.product_id, e.target.value)
                                    }
                                  />
                                  <button
                                    className="product-card-qty-btn"
                                    onClick={() => handleQuantityChange(product.product_id, 1)}
                                    title="Increase quantity"
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ==========================================================
              RIGHT: REAL-TIME SUMMARY PANEL (Sticky Desktop Sidebar)
              ========================================================== */}
          <aside className="summary-panel">
            <div className="summary-header">
              <h3 className="summary-title">
                <CreditCard size={18} color="var(--airtel-red)" />
                Bundle Summary
              </h3>
              <span className="summary-count-badge">
                {selectedProductIds.size} {selectedProductIds.size === 1 ? 'Product' : 'Products'}
              </span>
            </div>

            {/* Dependency Warning Alert Box in Summary */}
            {unmetDependencies.length > 0 && (
              <div className="summary-alert-box">
                <div className="summary-alert-title">
                  <ShieldAlert size={15} />
                  Prerequisite Action Needed ({unmetDependencies.length})
                </div>
                {unmetDependencies.map((dep) => (
                  <div key={dep.productId} className="summary-alert-item">
                    <p>
                      <strong>{dep.productName}</strong> requires an active Airtel fibre or leased line.
                    </p>
                    {dep.missingOptions?.length > 0 && (
                      <button
                        className="summary-alert-btn"
                        onClick={() => handleAddDependencyPrereq(dep.missingOptions[0].id)}
                      >
                        + Add {dep.missingOptions[0].name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Itemized Selected Products List */}
            {selectedItemsList.length > 0 ? (
              <div className="summary-items-list">
                {selectedItemsList.map((item) => (
                  <div key={item.product_id} className="summary-item-row">
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.product_name}</span>
                      <span className="summary-item-unit-qty">
                        {item.quantity} × {formatINR(item.price_min_inr_per_month)} ({item.unit})
                      </span>
                    </div>
                    <div className="summary-item-right">
                      <span className="summary-item-price">{formatINR(item.lineMonthly)}/mo</span>
                      <button
                        className="summary-item-remove-btn"
                        title="Remove product"
                        onClick={() => handleToggleProduct(item.product_id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="summary-empty-state">
                <p>No products selected yet.</p>
                <button className="summary-empty-btn" onClick={handleResetToRecommended}>
                  Add Recommended Bundle
                </button>
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="summary-pricing-breakdown">
              <div className="summary-price-line">
                <span>Monthly Subtotal</span>
                <strong>{formatINR(monthlyTotal)}/mo</strong>
              </div>

              <div className="summary-price-line">
                <span>One-Time Setup Fee</span>
                <strong style={{ color: setupTotal === 0 ? '#34d399' : '#fff' }}>
                  {setupTotal === 0 ? 'FREE (₹0)' : formatINR(setupTotal)}
                </strong>
              </div>

              <div className="summary-price-line">
                <span>Estimated GST (18%)</span>
                <strong>{formatINR(gstEstimate)}/mo</strong>
              </div>

              <div className="summary-price-line summary-price-line-total">
                <span>Total Recurring</span>
                <div className="summary-monthly-total-val">
                  {formatINR(monthlyTotal)}
                  <span>/mo</span>
                </div>
              </div>

              <p className="summary-gst-disclaimer">
                Total with 18% GST: {formatINR(grandTotalMonthly)}/mo. GST input tax credit available
                for registered businesses.
              </p>
            </div>

            {/* SLA & Contract Duration Chips */}
            <div className="summary-meta-chips">
              <span className="summary-chip">
                <CheckCircle2 size={13} color="#10b981" />
                Contract: {maxContractMonths ? formatDuration(maxContractMonths) : 'Flexible'}
              </span>
              <span className="summary-chip">
                <CheckCircle2 size={13} color="#10b981" />
                99.9% Uptime SLA
              </span>
              <span className="summary-chip">
                <CheckCircle2 size={13} color="#10b981" />
                Dedicated Account Manager
              </span>
            </div>

            {/* Comparison Callout in Summary */}
            {currentSpend > 0 && monthlyTotal > 0 && (
              <div
                style={{
                  background: savings.isCheaper ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${savings.isCheaper ? 'rgba(16, 185, 129, 0.3)' : 'var(--qd-border-subtle)'}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 18,
                  fontSize: 12,
                }}
              >
                {savings.isCheaper ? (
                  <div style={{ color: '#34d399', fontWeight: 600 }}>
                    🎉 You will save ~{formatINR(savings.difference)} every month ({savings.percentage}% reduction) compared to your current bills.
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8' }}>
                    Enterprise connectivity with centralized GST billing and 24x7 priority support.
                  </div>
                )}
              </div>
            )}

            {/* Proceed to KYC Action */}
            <button
              className="summary-proceed-btn"
              disabled={selectedProductIds.size === 0}
              onClick={handleProceedToKyc}
            >
              <span>Proceed to KYC & Activation</span>
              <ArrowRight size={18} />
            </button>

            <div className="summary-footer-guarantee">
              <ShieldCheck size={14} color="#10B981" />
              <span>Airtel Enterprise Guarantee • Fast Paperless KYC</span>
            </div>
          </aside>
        </div>
      </div>

      {/* ==========================================================
          MOBILE FLOATING BOTTOM BAR
          ========================================================== */}
      <div className="summary-mobile-bar">
        <div className="summary-mobile-info">
          <div className="summary-mobile-price">
            {formatINR(monthlyTotal)}
            <span>/mo</span>
          </div>
          <div className="summary-mobile-meta">
            {selectedProductIds.size} {selectedProductIds.size === 1 ? 'item' : 'items'} • Setup: {setupTotal === 0 ? 'FREE' : formatINR(setupTotal)}
          </div>
        </div>

        <button
          className="summary-mobile-btn"
          disabled={selectedProductIds.size === 0}
          onClick={handleProceedToKyc}
        >
          <span>Proceed to KYC</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
