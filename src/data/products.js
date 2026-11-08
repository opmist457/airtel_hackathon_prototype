/**
 * Project Udyam Digital - Product Catalog & Eligibility Layer
 * Airtel SYNC Hackathon
 * 
 * Provides:
 * - Product loading with memory caching
 * - Rule-based eligibility filtering based on business profile
 * - Product dependency resolution
 * - Bundle pricing and breakdown calculation
 * - Business segment mappings
 */

import { STATIC_PRODUCTS } from './productsCatalog.js';

/**
 * Segment mapping from segment key to user-facing display name.
 */
export const SEGMENT_MAP = {
  micro: 'Micro retail & services',
  prof: 'Professional offices',
  multi: 'Small multi-site businesses',
  mfg: 'Small manufacturers'
};

/**
 * Common business types mapped to canonical segment keys.
 */
export const BUSINESS_TYPE_TO_SEGMENT = {
  // Micro retail & services
  kirana: 'micro',
  grocery: 'micro',
  salon: 'micro',
  pharmacy: 'micro',
  bakery: 'micro',
  sweet_shop: 'micro',
  'sweet shop': 'micro',
  sweets: 'micro',
  retail: 'micro',
  stationery: 'micro',
  boutique: 'micro',
  cafe: 'micro',
  restaurant: 'micro',
  quick_service: 'micro',
  micro: 'micro',
  'micro retail & services': 'micro',

  // Professional offices
  clinic: 'prof',
  doctor: 'prof',
  dental: 'prof',
  diagnostic: 'prof',
  ca_firm: 'prof',
  'ca firm': 'prof',
  ca: 'prof',
  accounting: 'prof',
  coaching: 'prof',
  coaching_centre: 'prof',
  'coaching centre': 'prof',
  law_office: 'prof',
  'law office': 'prof',
  law_firm: 'prof',
  'law firm': 'prof',
  advocate: 'prof',
  architect: 'prof',
  consultancy: 'prof',
  consultant: 'prof',
  it_services: 'prof',
  agency: 'prof',
  prof: 'prof',
  'professional offices': 'prof',

  // Small multi-site businesses
  chains: 'multi',
  chain: 'multi',
  multi_store: 'multi',
  'multi-store retail': 'multi',
  'multi store retail': 'multi',
  retail_chain: 'multi',
  'retail chain': 'multi',
  restaurant_chains: 'multi',
  'restaurant chains': 'multi',
  restaurant_chain: 'multi',
  multi_site: 'multi',
  'multi site': 'multi',
  'small multi-site businesses': 'multi',
  franchise: 'multi',
  multi: 'multi',

  // Small manufacturers
  mfg: 'mfg',
  manufacturing: 'mfg',
  'small manufacturers': 'mfg',
  'auto-parts': 'mfg',
  auto_parts: 'mfg',
  'auto parts': 'mfg',
  textile: 'mfg',
  textiles: 'mfg',
  packaging: 'mfg',
  'plastic moulding': 'mfg',
  plastic_moulding: 'mfg',
  plastic: 'mfg',
  fabrication: 'mfg',
  engineering: 'mfg',
  garments: 'mfg',
  food_processing: 'mfg'
};

/**
 * Resolves any business type input or segment string into a valid segment key.
 * 
 * @param {string} businessTypeOrSegment - Raw business type or segment name
 * @returns {'micro' | 'prof' | 'multi' | 'mfg'} Canonical segment key
 */
export function resolveSegment(businessTypeOrSegment) {
  if (!businessTypeOrSegment || typeof businessTypeOrSegment !== 'string') {
    return 'micro';
  }

  const normalized = businessTypeOrSegment.trim().toLowerCase();

  if (SEGMENT_MAP[normalized]) {
    return normalized;
  }

  if (BUSINESS_TYPE_TO_SEGMENT[normalized]) {
    return BUSINESS_TYPE_TO_SEGMENT[normalized];
  }

  // Check partial phrase matching
  for (const [key, seg] of Object.entries(BUSINESS_TYPE_TO_SEGMENT)) {
    if (normalized.includes(key)) {
      return seg;
    }
  }

  return 'micro';
}

// In-memory cache for loaded products
let productsCache = null;
let productsLoadingPromise = null;

/**
 * Loads the Airtel product catalog from /data/products.json.
 * Uses in-memory caching to avoid redundant network requests.
 * 
 * @returns {Promise<Array<object>>} Resolves with array of product definitions
 */
export async function loadProducts() {
  if (productsCache) {
    return productsCache;
  }

  if (productsLoadingPromise) {
    return productsLoadingPromise;
  }

  productsLoadingPromise = (async () => {
    try {
      if (typeof fetch === 'function' && typeof window !== 'undefined') {
        const response = await fetch('/data/products.json');
        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
        }
        productsCache = await response.json();
      } else {
        // In Node.js / offline / SSR environments, fallback to embedded catalog
        productsCache = STATIC_PRODUCTS;
      }
      return productsCache;
    } catch (err) {
      if (STATIC_PRODUCTS && STATIC_PRODUCTS.length > 0) {
        productsCache = STATIC_PRODUCTS;
        return productsCache;
      }
      throw err;
    } finally {
      productsLoadingPromise = null;
    }
  })();

  return productsLoadingPromise;
}

/**
 * Synchronous getter to retrieve currently cached or static products.
 * 
 * @returns {Array<object>} Current list of products
 */
export function getProductsSync() {
  return productsCache || STATIC_PRODUCTS || [];
}

/**
 * Filters the product catalog to only include products eligible for the given business profile.
 * 
 * Filters based on:
 * 1. city_tier match (available_city_tiers contains the tier)
 * 2. employee_count >= min_employees
 * 3. num_sites >= min_sites
 * 4. if requires_gstin=Y, business must have GSTIN
 * 5. target_segments contains the business segment
 * 
 * @param {object} businessProfile - Business profile details
 * @param {Array<object>} [allProducts] - Optional custom catalog array (uses cached/static if omitted)
 * @returns {Array<object>} List of eligible products
 */
export function getEligibleProducts(businessProfile = {}, allProducts = null) {
  const catalog = allProducts || getProductsSync();

  // Normalize city tier to clean string ('1', '2', etc.)
  const rawTier = businessProfile.city_tier ?? businessProfile.cityTier ?? businessProfile.tier ?? '1';
  const cityTier = String(rawTier).replace(/\D/g, '') || '1';

  // Normalize counts
  const employeeCount = Number(businessProfile.employee_count ?? businessProfile.employeeCount ?? 1);
  const numSites = Number(businessProfile.num_sites ?? businessProfile.numSites ?? 1);

  // Normalize GSTIN status (true if has_gstin/hasGSTIN boolean or non-empty string)
  const hasGSTIN = Boolean(
    businessProfile.has_gstin === true ||
    businessProfile.hasGSTIN === true ||
    (typeof businessProfile.gstin === 'string' && businessProfile.gstin.trim().length > 0)
  );

  // Normalize segment
  const rawSegment = businessProfile.segment ?? businessProfile.business_type ?? businessProfile.businessType;
  const segment = rawSegment ? resolveSegment(rawSegment) : null;

  return catalog.filter(product => {
    // 1. City Tier match: available_city_tiers must contain the tier
    if (Array.isArray(product.available_city_tiers) && product.available_city_tiers.length > 0) {
      const tiersStr = product.available_city_tiers.map(String);
      if (!tiersStr.includes(cityTier)) {
        return false;
      }
    }

    // 2. Employee count match: employee_count >= min_employees
    const minEmp = Number(product.min_employees ?? 0);
    if (employeeCount < minEmp) {
      return false;
    }

    // 3. Num sites match: num_sites >= min_sites
    const minSites = Number(product.min_sites ?? 0);
    if (numSites < minSites) {
      return false;
    }

    // 4. GSTIN requirement: if requires_gstin === 'Y', business must have GSTIN
    if (product.requires_gstin === 'Y' && !hasGSTIN) {
      return false;
    }

    // 5. Target segments: target_segments contains the business segment
    if (segment && Array.isArray(product.target_segments) && product.target_segments.length > 0) {
      if (!product.target_segments.includes(segment)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Checks dependencies for a list of selected product IDs.
 * A product may have `requires_one_of` specifying that at least one prerequisite product must be selected.
 * 
 * @param {Array<string|object>} selectedProductIds - Selected product IDs or product objects
 * @param {Array<object>} [allProducts] - Optional custom catalog array
 * @returns {Array<{productId: string, productName: string, requiresOneOf: string[], message: string}>}
 *   Array of products that are missing prerequisite dependencies
 */
export function checkDependencies(selectedProductIds = [], allProducts = null) {
  const catalog = allProducts || getProductsSync();

  // Build a lookup map of all products
  const productMap = new Map();
  for (const p of catalog) {
    if (p && p.product_id) {
      productMap.set(p.product_id, p);
    }
  }

  // Normalize selected IDs into a Set of strings
  const selectedIdSet = new Set();
  for (const item of selectedProductIds) {
    if (!item) continue;
    if (typeof item === 'string') {
      selectedIdSet.add(item.trim());
    } else if (typeof item === 'object') {
      const id = item.product_id || item.productId || item.id;
      if (id) {
        selectedIdSet.add(String(id).trim());
      }
    }
  }

  const missingDependencies = [];

  for (const pid of selectedIdSet) {
    const product = productMap.get(pid);
    if (!product) continue;

    // Check requires_one_of dependency constraint
    if (Array.isArray(product.requires_one_of) && product.requires_one_of.length > 0) {
      const hasSatisfiedDependency = product.requires_one_of.some(reqId => selectedIdSet.has(reqId));
      if (!hasSatisfiedDependency) {
        missingDependencies.push({
          product_id: product.product_id,
          productId: product.product_id,
          product_name: product.product_name,
          productName: product.product_name,
          requires_one_of: product.requires_one_of,
          requiresOneOf: product.requires_one_of,
          message: `${product.product_name} (${product.product_id}) requires at least one of: ${product.requires_one_of.join(', ')}`
        });
      }
    }
  }

  return missingDependencies;
}

/**
 * Calculates bundle totals (monthly recurring and one-time setup) and details for selected products.
 * 
 * @param {Array<object>} selectedProducts - Selected product objects or items with { product, quantity }
 * @returns {{
 *   monthly_total: number,
 *   setup_total: number,
 *   products_detail: Array<object>,
 *   monthlyTotal: number,
 *   setupTotal: number,
 *   productsDetail: Array<object>
 * }}
 */
export function calculateBundle(selectedProducts = []) {
  let monthly_total = 0;
  let setup_total = 0;
  const products_detail = [];

  for (const item of selectedProducts) {
    if (!item) continue;

    // Support both direct product object and wrapped { product, quantity }
    const product = item.product && typeof item.product === 'object' ? item.product : item;
    const quantity = Math.max(1, Number(item.quantity ?? product.quantity ?? 1));

    const minMonthlyPrice = Number(product.price_min_inr_per_month ?? product.price ?? 0);
    const maxMonthlyPrice = Number(product.price_max_inr_per_month ?? minMonthlyPrice);
    const setupPrice = Number(product.one_time_setup_inr ?? 0);

    const itemMonthlyTotal = minMonthlyPrice * quantity;
    const itemSetupTotal = setupPrice * quantity;

    monthly_total += itemMonthlyTotal;
    setup_total += itemSetupTotal;

    products_detail.push({
      product_id: product.product_id || product.id || '',
      productId: product.product_id || product.id || '',
      product_name: product.product_name || product.name || '',
      productName: product.product_name || product.name || '',
      category: product.category || 'Connectivity',
      unit: product.unit || 'per unit',
      quantity,
      price_min_inr_per_month: minMonthlyPrice,
      price_max_inr_per_month: maxMonthlyPrice,
      one_time_setup_inr: setupPrice,
      monthly_total: itemMonthlyTotal,
      setup_total: itemSetupTotal,
      monthlyTotal: itemMonthlyTotal,
      setupTotal: itemSetupTotal,
      typical_install_days: product.typical_install_days || 3,
      requires_gstin: product.requires_gstin || 'N'
    });
  }

  return {
    monthly_total,
    setup_total,
    products_detail,
    // Convenient camelCase aliases
    monthlyTotal: monthly_total,
    setupTotal: setup_total,
    productsDetail: products_detail
  };
}

export default {
  SEGMENT_MAP,
  BUSINESS_TYPE_TO_SEGMENT,
  resolveSegment,
  loadProducts,
  getProductsSync,
  getEligibleProducts,
  checkDependencies,
  calculateBundle
};
