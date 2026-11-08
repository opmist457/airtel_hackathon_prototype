/**
 * Project Udyam Digital - AI Advisor & Recommendation Engine
 * Airtel SYNC Hackathon
 * 
 * Provides:
 * - Segment detection based on business type and operating profile
 * - Rule-based product eligibility filtering
 * - Segment-tailored bundle generation (Micro, Professional, Multi-site, Manufacturing)
 * - Intelligent dependency validation
 * - Financial breakdown and human-readable strategic reasoning
 */

import {
  SEGMENT_MAP,
  resolveSegment,
  getEligibleProducts,
  checkDependencies,
  calculateBundle,
  getProductsSync
} from './products.js';

/**
 * Generates an optimized, segment-tailored Airtel B2B product recommendation.
 * 
 * Profile schema:
 * @param {object} profile
 * @param {string} [profile.businessType] - e.g., 'kirana', 'clinic', 'retail_chain', 'auto-parts'
 * @param {string} [profile.segment] - e.g., 'micro', 'prof', 'multi', 'mfg'
 * @param {number} [profile.employeeCount] - Number of employees (default: segment-aware)
 * @param {number} [profile.numSites] - Number of physical operating sites (default: 1)
 * @param {string|number} [profile.cityTier] - '1' or '2' (default: '1')
 * @param {boolean} [profile.hasGSTIN] - Whether business has an active GSTIN
 * @param {number} [profile.currentSpend] - Current monthly telecom/IT spend in INR
 * @param {string} [profile.currentInternet] - Current internet type ('none', 'mobile_hotspot', 'broadband', 'leased_line', etc.)
 * @param {string[]} [profile.productsOfInterest] - Specific product IDs or interest categories
 * @param {Array<object>} [allProducts] - Optional catalog array override
 * 
 * @returns {{
 *   recommendedProducts: Array<object>,
 *   monthlyTotal: number,
 *   setupTotal: number,
 *   reasoning: string,
 *   segment: 'micro'|'prof'|'multi'|'mfg',
 *   segmentName: string,
 *   monthly_total: number,
 *   setup_total: number,
 *   eligibleProducts: Array<object>,
 *   productsDetail: Array<object>
 * }}
 */
export function getRecommendation(profile = {}, allProducts = null) {
  const catalog = allProducts || getProductsSync();
  const catalogMap = new Map(catalog.map(p => [p.product_id, p]));

  // --------------------------------------------------------------------------
  // a) Determine the segment from businessType / segment
  // --------------------------------------------------------------------------
  const rawType = profile.businessType || profile.business_type || '';
  const rawSegment = profile.segment || '';
  
  let segment = 'micro';
  if (rawSegment && SEGMENT_MAP[rawSegment.toLowerCase()]) {
    segment = rawSegment.toLowerCase();
  } else if (rawType) {
    segment = resolveSegment(rawType);
  } else if (Number(profile.numSites || profile.num_sites) >= 3) {
    segment = 'multi';
  }

  // --------------------------------------------------------------------------
  // Normalize profile parameters with segment-aware intelligent defaults
  // --------------------------------------------------------------------------
  const rawCityTier = String(profile.cityTier ?? profile.city_tier ?? '1');
  const cityTier = rawCityTier.includes('2') ? '2' : '1';
  
  // Segment-aware default employee counts if unspecified
  const defaultEmployees = {
    micro: 2,
    prof: 5,
    multi: 10,
    mfg: 15
  };
  const rawEmp = profile.employeeCount ?? profile.employee_count;
  let employeeCount = defaultEmployees[segment];
  if (typeof rawEmp === 'number' && !isNaN(rawEmp)) {
    employeeCount = Math.max(1, rawEmp);
  } else if (typeof rawEmp === 'string') {
    if (rawEmp.includes('50+')) employeeCount = 55;
    else if (rawEmp.includes('16-50')) employeeCount = 25;
    else if (rawEmp.includes('6-15')) employeeCount = 10;
    else if (rawEmp.includes('1-5')) employeeCount = 3;
    else {
      const parsed = parseInt(rawEmp, 10);
      if (!isNaN(parsed)) employeeCount = Math.max(1, parsed);
    }
  }

  // Segment-aware default site counts
  const defaultSites = segment === 'multi' ? 3 : 1;
  const rawSites = profile.numSites ?? profile.num_sites ?? profile.locations;
  let numSites = defaultSites;
  if (typeof rawSites === 'number' && !isNaN(rawSites)) {
    numSites = Math.max(1, rawSites);
  } else if (typeof rawSites === 'string') {
    if (rawSites.includes('10+')) numSites = 12;
    else if (rawSites.includes('6-10')) numSites = 8;
    else if (rawSites.includes('2-5')) numSites = 3;
    else if (rawSites.includes('1')) numSites = 1;
    else {
      const parsed = parseInt(rawSites, 10);
      if (!isNaN(parsed)) numSites = Math.max(1, parsed);
    }
  }

  // GSTIN status: Handles string 'Yes'/'No', boolean, or presence
  const rawGSTIN = profile.hasGSTIN ?? profile.has_gstin ?? profile.hasGstin ?? profile.gstin;
  const hasGSTIN = typeof rawGSTIN === 'string'
    ? rawGSTIN.toLowerCase() === 'yes' || rawGSTIN.toLowerCase() === 'true'
    : (rawGSTIN !== undefined ? Boolean(rawGSTIN) : true);

  // Current Spend / Budget
  let currentSpend = 0;
  const rawSpend = profile.currentSpend ?? profile.current_spend ?? profile.budget;
  if (typeof rawSpend === 'number' && !isNaN(rawSpend)) {
    currentSpend = rawSpend;
  } else if (typeof rawSpend === 'string') {
    if (rawSpend.includes('Under ₹1,000')) currentSpend = 900;
    else if (rawSpend.includes('₹1,000-3,000')) currentSpend = 2000;
    else if (rawSpend.includes('₹3,000-10,000')) currentSpend = 5000;
    else if (rawSpend.includes('₹10,000+')) currentSpend = 15000;
    else {
      const parsed = parseInt(rawSpend.replace(/\D/g, ''), 10);
      if (!isNaN(parsed)) currentSpend = parsed;
    }
  }

  const currentInternet = String(profile.currentInternet ?? profile.current_internet ?? '').toLowerCase();
  const productsOfInterest = Array.isArray(profile.productsOfInterest || profile.products_of_interest)
    ? (profile.productsOfInterest || profile.products_of_interest)
    : [];

  const normalizedProfile = {
    businessType: rawType || segment,
    segment,
    employeeCount,
    numSites,
    cityTier,
    hasGSTIN,
    currentSpend,
    currentInternet,
    productsOfInterest
  };

  // --------------------------------------------------------------------------
  // b) Filter eligible products
  // --------------------------------------------------------------------------
  const eligibleProducts = getEligibleProducts(normalizedProfile, catalog);
  const eligibleMap = new Map(eligibleProducts.map(p => [p.product_id, p]));

  // Helper to safely get product definition (eligible preferred, fallback to catalog)
  const getProduct = (productId) => eligibleMap.get(productId) || catalogMap.get(productId);

  // --------------------------------------------------------------------------
  // c) Build recommended bundle based on segment patterns:
  //    - Micro: basic broadband (P01 or P04) + mobile lines (P07) + WhatsApp (P15) + optional POS (P19)
  //    - Professional: better broadband (P02) + mobile (P08) + cloud email (P16) + security (P20)
  //    - Multi-site: broadband per site (P01/P02) + failover (P09) + CCTV (P23) + SD-WAN if 3+ sites (P10)
  //    - Manufacturing: leased line (P05) + IoT (P24) + firewall (P21) + fleet tracker (P25)
  // --------------------------------------------------------------------------
  const selectedBundleItems = [];
  const reasoningPoints = [];

  if (segment === 'micro') {
    // 1. Basic broadband: Biz Fibre 100 (P01) or Biz 5G AirFiber 100 (P04)
    // Select AirFiber if user indicates wireless/5G preference, or if Fibre is not eligible
    const prefersWireless = currentInternet.includes('5g') || 
                            currentInternet.includes('wireless') || 
                            currentInternet.includes('airfiber') ||
                            currentInternet.includes('dongle');
    
    let broadbandId = 'P01';
    if (prefersWireless || (!eligibleMap.has('P01') && eligibleMap.has('P04'))) {
      broadbandId = 'P04';
    } else if (!eligibleMap.has('P01') && !eligibleMap.has('P04')) {
      // Fallback if neither is strictly eligible
      broadbandId = 'P01';
    }

    const broadbandProduct = getProduct(broadbandId);
    if (broadbandProduct) {
      selectedBundleItems.push({
        ...broadbandProduct,
        quantity: numSites
      });
      reasoningPoints.push(
        broadbandId === 'P04'
          ? `Biz 5G AirFiber 100 (${broadbandId}) selected for plug-and-play wireless deployment without trenching delays.`
          : `Biz Fibre 100 (${broadbandId}) provides unlimited reliable 100 Mbps business-grade fibre connectivity for your shop.`
      );
    }

    // 2. Mobile lines: Business Postpaid 299 (P07)
    const mobileProduct = getProduct('P07');
    if (mobileProduct) {
      const mobileQty = Math.max(1, Math.min(employeeCount, 3));
      selectedBundleItems.push({
        ...mobileProduct,
        quantity: mobileQty
      });
      reasoningPoints.push(
        `Business Postpaid 299 (P07) provides ${mobileQty} business line(s) with 50 GB data each and pooled enterprise calling.`
      );
    }

    // 3. WhatsApp Business API Starter (P15)
    const waProduct = getProduct('P15');
    if (waProduct) {
      selectedBundleItems.push({
        ...waProduct,
        quantity: 1
      });
      if (hasGSTIN) {
        reasoningPoints.push(
          `WhatsApp Business API Starter (P15) enables automated order updates, customer catalogue sharing, and verified green badge.`
        );
      } else {
        reasoningPoints.push(
          `WhatsApp Business API Starter (P15) recommended for catalogue ordering (GSTIN registration will unlock full API access).`
        );
      }
    }

    // 4. Optional POS: Cloud POS & Billing (P19)
    // Include if retail, kirana, bakery, pharmacy, salon, or explicitly requested
    const retailKeywords = ['kirana', 'grocery', 'retail', 'salon', 'pharmacy', 'bakery', 'sweet', 'shop', 'pos', 'billing', 'store', 'cafe', 'restaurant'];
    const isRetailType = retailKeywords.some(kw => rawType.toLowerCase().includes(kw)) || rawType === 'micro' || rawType === '';
    const wantsPOS = isRetailType || productsOfInterest.some(p => String(p).toLowerCase().includes('pos') || p === 'P19');

    if (wantsPOS) {
      const posProduct = getProduct('P19');
      if (posProduct) {
        selectedBundleItems.push({
          ...posProduct,
          quantity: 1
        });
        reasoningPoints.push(
          `Cloud POS & Billing (P19) included for fast GST billing, automated inventory alerts, and instant UPI/card payment acceptance.`
        );
      }
    }

  } else if (segment === 'prof') {
    // Professional offices:
    // Better broadband (P02) + mobile (P08) + cloud email (P16) + security (P20)
    
    // 1. Better broadband: Biz Fibre 300 (P02)
    const broadbandProduct = getProduct('P02') || getProduct('P01');
    if (broadbandProduct) {
      selectedBundleItems.push({
        ...broadbandProduct,
        quantity: numSites
      });
      reasoningPoints.push(
        `Biz Fibre 300 (${broadbandProduct.product_id}) provides 300 Mbps symmetrical high-speed internet, crucial for video conferences, large file uploads, and VoIP calls.`
      );
    }

    // 2. Mobile lines: Business Postpaid 599 (P08)
    const mobileProduct = getProduct('P08') || getProduct('P07');
    if (mobileProduct) {
      const mobileQty = Math.max(1, Math.min(employeeCount, 5));
      selectedBundleItems.push({
        ...mobileProduct,
        quantity: mobileQty
      });
      reasoningPoints.push(
        `Business Postpaid 599 (${mobileProduct.product_id}) equipped with 150 GB data per line and national roaming for ${mobileQty} key professionals.`
      );
    }

    // 3. Cloud email: Cloud Email & Office Suite (P16)
    const emailProduct = getProduct('P16');
    if (emailProduct) {
      const emailUsers = Math.max(1, employeeCount);
      selectedBundleItems.push({
        ...emailProduct,
        quantity: emailUsers
      });
      reasoningPoints.push(
        `Cloud Email & Office Suite (P16) provisions professional custom domain email addresses, secure cloud storage, and video conferencing for all ${emailUsers} team members.`
      );
    }

    // 4. Security: Endpoint Security (P20)
    const secProduct = getProduct('P20');
    if (secProduct) {
      const secDevices = Math.max(1, employeeCount);
      selectedBundleItems.push({
        ...secProduct,
        quantity: secDevices
      });
      reasoningPoints.push(
        `Endpoint Security (P20) safeguards ${secDevices} workstations against phishing, malware, and ransomware threats.`
      );
    }

  } else if (segment === 'multi') {
    // Multi-site:
    // Broadband per site (P01/P02) + failover (P09) + CCTV (P23) + SD-WAN if 3+ sites (P10)

    // 1. Broadband per site: P02 (Tier 1/large) or P01
    const useHigherTier = cityTier === '1' || employeeCount >= 10 || currentSpend > 3000;
    const broadbandId = useHigherTier ? 'P02' : 'P01';
    const broadbandProduct = getProduct(broadbandId) || getProduct('P01');
    if (broadbandProduct) {
      selectedBundleItems.push({
        ...broadbandProduct,
        quantity: numSites
      });
      reasoningPoints.push(
        `${broadbandProduct.product_name} (${broadbandProduct.product_id}) deployed across all ${numSites} locations to ensure uniform corporate connectivity.`
      );
    }

    // 2. Failover: Backup 4G/5G Failover (P09)
    const failoverProduct = getProduct('P09');
    if (failoverProduct) {
      selectedBundleItems.push({
        ...failoverProduct,
        quantity: numSites
      });
      reasoningPoints.push(
        `Backup 4G/5G Failover (P09) installed at each site to provide instantaneous 99.9% uptime redundancy if primary wired links experience interruption.`
      );
    }

    // 3. CCTV: Cloud CCTV (P23)
    const cctvProduct = getProduct('P23');
    if (cctvProduct) {
      const cctvCount = Math.max(2, numSites * 2);
      selectedBundleItems.push({
        ...cctvProduct,
        quantity: cctvCount
      });
      reasoningPoints.push(
        `Cloud CCTV (P23) deployed with ${cctvCount} cameras (${Math.round(cctvCount / numSites)} per site) featuring 30-day cloud recording and unified mobile surveillance.`
      );
    }

    // 4. SD-WAN: Managed SD-WAN (P10) if 3+ sites
    if (numSites >= 3) {
      const sdwanProduct = getProduct('P10');
      if (sdwanProduct) {
        selectedBundleItems.push({
          ...sdwanProduct,
          quantity: numSites
        });
        reasoningPoints.push(
          `Managed SD-WAN (P10) connects your ${numSites} sites with centralized application-priority routing, zero-touch provisioning, and encrypted inter-branch data flow.`
        );
      }
    }

  } else if (segment === 'mfg') {
    // Manufacturing:
    // Leased line (P05) + IoT (P24) + firewall (P21) + fleet tracker (P25)

    // 1. Leased Line: Internet Leased Line 20 (P05)
    const leasedLineProduct = getProduct('P05') || getProduct('P03') || getProduct('P02');
    if (leasedLineProduct) {
      selectedBundleItems.push({
        ...leasedLineProduct,
        quantity: numSites
      });
      reasoningPoints.push(
        `${leasedLineProduct.product_name} (${leasedLineProduct.product_id}) delivers dedicated 1:1 symmetrical bandwidth with 99.5% SLA commitment, mission-critical for factory ERP and industrial cloud sync.`
      );
    }

    // 2. IoT: Machine Monitoring IoT (P24)
    const iotProduct = getProduct('P24');
    if (iotProduct) {
      const iotDevices = Math.max(2, Math.floor(employeeCount / 5)) || 2;
      selectedBundleItems.push({
        ...iotProduct,
        quantity: iotDevices
      });
      reasoningPoints.push(
        `Machine Monitoring IoT (P24) equips ${iotDevices} key manufacturing units with telemetry sensors and industrial SIMs for predictive maintenance and energy analytics.`
      );
    }

    // 3. Firewall: Managed Firewall (P21)
    const firewallProduct = getProduct('P21');
    if (firewallProduct) {
      selectedBundleItems.push({
        ...firewallProduct,
        quantity: numSites
      });
      reasoningPoints.push(
        `Managed Firewall (P21) secures factory production networks and office workstations with 24x7 monitoring backed by Airtel SOC.`
      );
    }

    // 4. Fleet Tracker: Fleet Tracker (P25)
    const fleetProduct = getProduct('P25');
    if (fleetProduct) {
      const fleetQty = Math.max(2, Math.min(numSites * 2, 6));
      selectedBundleItems.push({
        ...fleetProduct,
        quantity: fleetQty
      });
      reasoningPoints.push(
        `Fleet Tracker (P25) tracks ${fleetQty} logistics and delivery vehicles with real-time GPS coordinates, route optimization, and fuel theft alerts.`
      );
    }
  }

  // --------------------------------------------------------------------------
  // Check dependency constraints on recommended bundle
  // --------------------------------------------------------------------------
  const bundleProductIds = selectedBundleItems.map(item => item.product_id);
  const dependencyIssues = checkDependencies(bundleProductIds, catalog);

  // If any dependency is missing, resolve it by adding the required prerequisite
  if (dependencyIssues.length > 0) {
    for (const issue of dependencyIssues) {
      if (Array.isArray(issue.requires_one_of) && issue.requires_one_of.length > 0) {
        const requiredId = issue.requires_one_of[0];
        if (!bundleProductIds.includes(requiredId)) {
          const prereqProduct = getProduct(requiredId);
          if (prereqProduct) {
            selectedBundleItems.unshift({
              ...prereqProduct,
              quantity: numSites
            });
            bundleProductIds.unshift(requiredId);
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // d) Calculate Totals and Construct Final Output
  // --------------------------------------------------------------------------
  const bundleCalculation = calculateBundle(selectedBundleItems);
  const monthlyTotal = bundleCalculation.monthly_total;
  const setupTotal = bundleCalculation.setup_total;

  // Build a polished executive reasoning narrative
  const segmentDisplayName = SEGMENT_MAP[segment] || 'Micro retail & services';
  let financialNote = '';
  if (currentSpend > 0) {
    const diff = monthlyTotal - currentSpend;
    if (diff < 0) {
      financialNote = ` This bundle delivers an estimated monthly savings of ₹${Math.abs(diff).toLocaleString('en-IN')} compared to your current spend of ₹${currentSpend.toLocaleString('en-IN')}, while consolidating all services under single Airtel B2B billing.`;
    } else {
      financialNote = ` For an incremental ₹${diff.toLocaleString('en-IN')} over your current spend of ₹${currentSpend.toLocaleString('en-IN')}, your enterprise gains guaranteed enterprise SLAs, failover protection, and business-grade security.`;
    }
  }

  const reasoning = [
    `Recommended for ${segmentDisplayName} (${rawType || segment}) operating across ${numSites} site(s) with ${employeeCount} employee(s) in City Tier ${cityTier}.`,
    ...reasoningPoints,
    financialNote
  ].filter(Boolean).join('\n\n');

  return {
    recommendedProducts: selectedBundleItems,
    monthlyTotal,
    setupTotal,
    reasoning,
    segment,
    // Supporting metadata
    segmentName: segmentDisplayName,
    monthly_total: monthlyTotal,
    setup_total: setupTotal,
    eligibleProducts,
    productsDetail: bundleCalculation.products_detail,
    dependencyIssues
  };
}

export const advisorEngine = {
  recommend: (profile, catalog) => getRecommendation(profile, catalog),
  getRecommendation
};

export default {
  advisorEngine,
  getRecommendation,
  recommend: (profile, catalog) => getRecommendation(profile, catalog)
};
