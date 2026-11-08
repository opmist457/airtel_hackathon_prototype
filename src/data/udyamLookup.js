/**
 * Project Udyam Digital - Udyam Lookup & Format Validator
 * Queries mock national MSME Udyam registry with real-time format validation,
 * enterprise tier classification, and DPDP-compliant masking.
 */

let udyamRegistryCache = null;

// Built-in fallback dataset containing specimen applicants (K01-K12) and key MSME leads
const SPECIMEN_UDYAM_MAP = {
  'UDYAM-MH-00-2675962': {
    udyam_number: 'UDYAM-MH-00-2675962',
    enterprise_name: 'Vindhya Tours & Travels LLP',
    name: 'Vindhya Tours & Travels LLP',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Services',
    nic_description: 'Travel agency',
    state: 'Maharashtra',
    city: 'Mumbai',
    date_of_registration: '2021-03-25',
    registration_date: '2021-03-25',
    applicant_code: 'K01'
  },
  'UDYAM-WB-00-5053330': {
    udyam_number: 'UDYAM-WB-00-5053330',
    enterprise_name: 'Harmony Dental Care',
    name: 'Harmony Dental Care',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Services',
    nic_description: 'Dental clinic',
    state: 'West Bengal',
    city: 'Kolkata',
    date_of_registration: '2022-09-27',
    registration_date: '2022-09-27',
    applicant_code: 'K02'
  },
  'UDYAM-KR-00-1115424': {
    udyam_number: 'UDYAM-KR-00-1115424',
    enterprise_name: 'Ganesh Woodcraft',
    name: 'Ganesh Woodcraft',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Manufacturing',
    nic_description: 'Furniture workshop',
    state: 'Karnataka',
    city: 'Bengaluru',
    date_of_registration: '2024-09-25',
    registration_date: '2024-09-25',
    applicant_code: 'K03'
  },
  'UDYAM-MH-00-6131836': {
    udyam_number: 'UDYAM-MH-00-6131836',
    enterprise_name: 'Saffron Dental Care LLP',
    name: 'Saffron Dental Care LLP',
    enterprise_type: 'Micro',
    type: 'Micro',
    major_activity: 'Services',
    nic_description: 'Dental clinic',
    state: 'Maharashtra',
    city: 'Nagpur',
    date_of_registration: '2020-10-24',
    registration_date: '2020-10-24',
    applicant_code: 'K04'
  },
  'UDYAM-KL-00-5521886': {
    udyam_number: 'UDYAM-KL-00-5521886',
    enterprise_name: 'Balaji Realty LLP',
    name: 'Balaji Realty LLP',
    enterprise_type: 'Micro',
    type: 'Micro',
    major_activity: 'Services',
    nic_description: 'Real estate agency',
    state: 'Kerala',
    city: 'Kochi',
    date_of_registration: '2022-11-13',
    registration_date: '2022-11-13',
    applicant_code: 'K05'
  },
  'UDYAM-RJ-00-6577157': {
    udyam_number: 'UDYAM-RJ-00-6577157',
    enterprise_name: 'Saffron Unisex Salon',
    name: 'Saffron Unisex Salon',
    enterprise_type: 'Micro',
    type: 'Micro',
    major_activity: 'Trading',
    nic_description: 'Salon',
    state: 'Rajasthan',
    city: 'Jaipur',
    date_of_registration: '2025-12-30',
    registration_date: '2025-12-30',
    applicant_code: 'K06'
  },
  'UDYAM-KR-00-4468149': {
    udyam_number: 'UDYAM-KR-00-4468149',
    enterprise_name: 'Neelgiri Physio Clinic LLP',
    name: 'Neelgiri Physio Clinic LLP',
    enterprise_type: 'Micro',
    type: 'Micro',
    major_activity: 'Services',
    nic_description: 'Physiotherapy clinic',
    state: 'Karnataka',
    city: 'Bengaluru',
    date_of_registration: '2021-07-03',
    registration_date: '2021-07-03',
    applicant_code: 'K07'
  },
  'UDYAM-BR-00-7880010': {
    udyam_number: 'UDYAM-BR-00-7880010',
    enterprise_name: 'Green Leaf Legal Associates',
    name: 'Green Leaf Legal Associates',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Services',
    nic_description: 'Law office',
    state: 'Bihar',
    city: 'Patna',
    date_of_registration: '2021-07-06',
    registration_date: '2021-07-06',
    applicant_code: 'K08'
  },
  'UDYAM-TS-00-8542181': {
    udyam_number: 'UDYAM-TS-00-8542181',
    enterprise_name: 'Kaveri Insurance Advisors Pvt Ltd',
    name: 'Kaveri Insurance Advisors Pvt Ltd',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Services',
    nic_description: 'Insurance agency',
    state: 'Telangana',
    city: 'Hyderabad',
    date_of_registration: '2021-11-03',
    registration_date: '2021-11-03',
    applicant_code: 'K09'
  },
  'UDYAM-MH-00-7183141': {
    udyam_number: 'UDYAM-MH-00-7183141',
    enterprise_name: 'Kaveri Stays LLP',
    name: 'Kaveri Stays LLP',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Trading',
    nic_description: 'Budget hotel group',
    state: 'Maharashtra',
    city: 'Mumbai',
    date_of_registration: '2024-02-02',
    registration_date: '2024-02-02',
    applicant_code: 'K10'
  },
  'UDYAM-KR-00-6326107': {
    udyam_number: 'UDYAM-KR-00-6326107',
    enterprise_name: 'Trinity Bake House Pvt Ltd',
    name: 'Trinity Bake House Pvt Ltd',
    enterprise_type: 'Small',
    type: 'Small',
    major_activity: 'Trading',
    nic_description: 'Bakery chain',
    state: 'Karnataka',
    city: 'Mysuru',
    date_of_registration: '2023-09-24',
    registration_date: '2023-09-24',
    applicant_code: 'K11'
  },
  'UDYAM-TN-00-3866196': {
    udyam_number: 'UDYAM-TN-00-3866196',
    enterprise_name: 'Star Electronics',
    name: 'Star Electronics',
    enterprise_type: 'Micro',
    type: 'Micro',
    major_activity: 'Trading',
    nic_description: 'Electronics retail chain',
    state: 'Tamil Nadu',
    city: 'Chennai',
    date_of_registration: '2021-04-25',
    registration_date: '2021-04-25',
    applicant_code: 'K12'
  },
  'UDYAM-KL-00-3078801': {
    udyam_number: 'UDYAM-KL-00-3078801',
    enterprise_name: 'Balaji Dental Care LLP',
    name: 'Balaji Dental Care LLP',
    enterprise_type: 'Micro',
    type: 'Micro',
    major_activity: 'Services',
    nic_description: 'Dental clinic',
    state: 'Kerala',
    city: 'Kochi',
    date_of_registration: '2023-12-25',
    registration_date: '2023-12-25'
  }
};

/**
 * Validates Udyam registration format in real-time.
 * Pattern: UDYAM-XX-00-NNNNNNN
 *
 * @param {string} udyam
 * @returns {{ isValid: boolean, error: string | null, formatted: string }}
 */
export function validateUdyamFormat(udyam) {
  if (!udyam || typeof udyam !== 'string') {
    return { isValid: false, error: 'Udyam number is required', formatted: '' };
  }

  const clean = udyam.trim().toUpperCase();

  if (clean.length === 0) {
    return { isValid: false, error: 'Please enter Udyam registration number', formatted: '' };
  }

  // Udyam format regex: UDYAM-[2 letters state]-[2 digits district]-[7 digits]
  const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;

  if (!udyamRegex.test(clean)) {
    if (!clean.startsWith('UDYAM-')) {
      return { isValid: false, error: 'Must begin with prefix "UDYAM-"', formatted: clean };
    }
    return {
      isValid: false,
      error: 'Invalid format. Expected: UDYAM-XX-00-NNNNNNN (e.g., UDYAM-WB-00-5053330)',
      formatted: clean
    };
  }

  return { isValid: true, error: null, formatted: clean };
}

/**
 * Mask Udyam number for privacy display
 * Example: UDYAM-WB-00-5053330 -> UDYAM-WB-**-****330
 *
 * @param {string} udyam
 * @returns {string}
 */
export function maskUdyam(udyam) {
  if (!udyam || typeof udyam !== 'string') return '';
  const clean = udyam.trim().toUpperCase();
  const parts = clean.split('-');
  if (parts.length === 4) {
    const lastDigits = parts[3];
    const maskedDigits = '****' + lastDigits.slice(-3);
    return `${parts[0]}-${parts[1]}-**-${maskedDigits}`;
  }
  return clean;
}

/**
 * Query the Udyam registry asynchronously.
 *
 * @param {string} udyamNumber
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export async function lookupUdyam(udyamNumber) {
  const validation = validateUdyamFormat(udyamNumber);
  if (!validation.isValid) {
    return { success: false, error: validation.error || 'Invalid Udyam format' };
  }

  const queryUdyam = validation.formatted;

  // 1. Check in-memory specimen map
  if (SPECIMEN_UDYAM_MAP[queryUdyam]) {
    const record = SPECIMEN_UDYAM_MAP[queryUdyam];
    return {
      success: true,
      data: {
        ...record,
        name: record.enterprise_name,
        type: record.enterprise_type,
        registration_date: record.date_of_registration
      }
    };
  }

  // 2. Fetch registry JSON if needed
  if (!udyamRegistryCache) {
    try {
      const response = await fetch('/data/udyam_registry.json');
      if (response.ok) {
        udyamRegistryCache = await response.json();
      }
    } catch {
      // offline/test fallback
    }
  }

  // 3. Search loaded cache
  if (udyamRegistryCache && udyamRegistryCache[queryUdyam]) {
    const record = udyamRegistryCache[queryUdyam];
    return {
      success: true,
      data: {
        ...record,
        name: record.enterprise_name,
        type: record.enterprise_type,
        registration_date: record.date_of_registration
      }
    };
  }

  return {
    success: false,
    error: `Udyam registration "${queryUdyam}" not found in national MSME database. Ensure district code "00" and 7-digit serial are correct.`
  };
}

export { SPECIMEN_UDYAM_MAP };
