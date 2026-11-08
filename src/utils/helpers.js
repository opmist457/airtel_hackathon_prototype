/**
 * Project Udyam Digital - Helper Utilities
 */

/**
 * Format an amount into Indian Rupee format (₹X,XX,XXX)
 * @param {number|string} amount
 * @returns {string} Formatted INR currency string
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format contract duration into human-readable string
 * Formats as '12 months' or '2 years'
 * @param {number|string} months
 * @returns {string}
 */
export function formatDuration(months) {
  const m = Number(months);
  if (!m || isNaN(m) || m <= 0) {
    return 'No lock-in';
  }
  if (m === 1) {
    return '1 month';
  }
  if (m >= 24 && m % 12 === 0) {
    const years = m / 12;
    return `${years} years`;
  }
  return `${m} months`;
}

/**
 * Calculate savings compared to current monthly spend
 * @param {number} currentSpend
 * @param {number} newSpend
 * @returns {{ difference: number, percentage: number, isCheaper: boolean, isMore: boolean }}
 */
export function calculateSavings(currentSpend, newSpend) {
  const current = Number(currentSpend) || 0;
  const next = Number(newSpend) || 0;
  if (current <= 0) {
    return { difference: 0, percentage: 0, isCheaper: false, isMore: false };
  }
  const diff = current - next;
  const pct = Math.round((Math.abs(diff) / current) * 100);
  return {
    difference: Math.abs(diff),
    percentage: pct,
    isCheaper: diff > 0,
    isMore: diff < 0,
  };
}

/**
 * Check if a product is eligible based on the business profile
 * @param {Object} product
 * @param {Object} businessProfile
 * @returns {{ eligible: boolean, reason: string | null }}
 */
export function checkProductEligibility(product, businessProfile) {
  if (!businessProfile || typeof businessProfile !== 'object') {
    return { eligible: true, reason: null };
  }

  // 1. City Tier check
  if (
    businessProfile.city_tier &&
    Array.isArray(product.available_city_tiers) &&
    product.available_city_tiers.length > 0
  ) {
    const profileTier = String(businessProfile.city_tier).trim();
    if (!product.available_city_tiers.includes(profileTier)) {
      return {
        eligible: false,
        reason: `Available in Tier ${product.available_city_tiers.join(' & ')} cities only (Location is Tier ${profileTier})`,
      };
    }
  }

  // 2. Minimum employees check
  const employees =
    businessProfile.employees ??
    businessProfile.employee_count ??
    businessProfile.number_of_employees;
  if (
    employees !== undefined &&
    employees !== null &&
    product.min_employees &&
    Number(employees) < Number(product.min_employees)
  ) {
    return {
      eligible: false,
      reason: `Requires at least ${product.min_employees} employees (Registered: ${employees})`,
    };
  }

  // 3. Minimum sites check
  const sites =
    businessProfile.sites ??
    businessProfile.site_count ??
    businessProfile.locations_count;
  if (
    sites !== undefined &&
    sites !== null &&
    product.min_sites &&
    Number(sites) < Number(product.min_sites)
  ) {
    return {
      eligible: false,
      reason: `Requires at least ${product.min_sites} business sites (Registered: ${sites})`,
    };
  }

  // 4. GSTIN check
  const hasGstin = Boolean(
    businessProfile.gstin &&
      String(businessProfile.gstin).trim() !== '' &&
      String(businessProfile.gstin).toLowerCase() !== 'null'
  );
  if (product.requires_gstin === 'Y' && businessProfile.has_gstin === false && !hasGstin) {
    return {
      eligible: false,
      reason: 'Mandatory GSTIN required for enterprise billing and statutory credit',
    };
  }

  return { eligible: true, reason: null };
}

/**
 * Validate product dependencies across selected items
 * @param {string[]} selectedIds - Array of selected product IDs
 * @param {Object[]} allProducts - Array of all product objects
 * @returns {Array<{ productId: string, productName: string, missingIds: string[], missingOptions: Array<{id: string, name: string}> }>}
 */
export function checkDependencies(selectedIds, allProducts) {
  if (!Array.isArray(selectedIds) || !Array.isArray(allProducts)) return [];
  const selectedSet = new Set(selectedIds);
  const productsMap = new Map(allProducts.map((p) => [p.product_id, p]));

  const unmet = [];

  for (const pid of selectedIds) {
    const prod = productsMap.get(pid);
    if (!prod || !Array.isArray(prod.requires_one_of) || prod.requires_one_of.length === 0) {
      continue;
    }

    const hasRequirement = prod.requires_one_of.some((reqId) => selectedSet.has(reqId));
    if (!hasRequirement) {
      const missingOptions = prod.requires_one_of
        .map((reqId) => productsMap.get(reqId))
        .filter(Boolean)
        .map((p) => ({ id: p.product_id, name: p.product_name }));

      unmet.push({
        productId: prod.product_id,
        productName: prod.product_name,
        missingIds: prod.requires_one_of,
        missingOptions,
      });
    }
  }

  return unmet;
}
