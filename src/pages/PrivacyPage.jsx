import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  EyeOff,
  Clock,
  Key,
  HelpCircle,
  Mail,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Server,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import './PrivacyPage.css';

/**
 * Safe Navigation Link helper
 */
function SafeLink({ to, children, className = '', ...props }) {
  try {
    return (
      <Link to={to} className={className} {...props}>
        {children}
      </Link>
    );
  } catch (err) {
    return (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    );
  }
}

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('dpdp-act');
  const [showConsentModal, setShowConsentModal] = useState(false);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="privacy-page-root">
      {/* Breadcrumb row */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.5rem 0', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#64748b' }}>
          <SafeLink to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</SafeLink>
          <ChevronRight size={14} />
          <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Privacy & DPDP Compliance</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="privacy-hero">
        <div className="privacy-badge-row">
          <span className="dpdp-cert-badge">
            <ShieldCheck size={16} />
            DPDP Act 2023 Compliant Architecture
          </span>
          <span className="privacy-meta-badge">Last Updated: July 2026</span>
          <span className="privacy-meta-badge">Version 2.4 (Enterprise SMB)</span>
        </div>

        <h1 className="privacy-title">Privacy Policy & Data Security Charter</h1>
        <p className="privacy-subtitle">
          Bharti Airtel Limited is committed to the highest standards of transparency, data minimization, and statutory
          compliance under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. Here is how Project
          Udyam Digital protects your enterprise data at every step.
        </p>
      </section>

      {/* Main Content Layout */}
      <div className="privacy-layout">
        {/* Sticky Table of Contents */}
        <aside className="privacy-toc-box">
          <div className="privacy-toc-title">Table of Contents</div>
          <ul className="privacy-toc-list">
            <li>
              <a
                href="#dpdp-act"
                className={`privacy-toc-link ${activeSection === 'dpdp-act' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('dpdp-act');
                }}
              >
                <ShieldCheck size={14} />
                <span>1. DPDP Act 2023 Compliance</span>
              </a>
            </li>
            <li>
              <a
                href="#purpose-limitation"
                className={`privacy-toc-link ${activeSection === 'purpose-limitation' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('purpose-limitation');
                }}
              >
                <FileText size={14} />
                <span>2. Data Collection & Purpose</span>
              </a>
            </li>
            <li>
              <a
                href="#consent-mechanism"
                className={`privacy-toc-link ${activeSection === 'consent-mechanism' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('consent-mechanism');
                }}
              >
                <UserCheck size={14} />
                <span>3. Consent Mechanism</span>
              </a>
            </li>
            <li>
              <a
                href="#data-minimization"
                className={`privacy-toc-link ${activeSection === 'data-minimization' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('data-minimization');
                }}
              >
                <Sparkles size={14} />
                <span>4. Data Minimization</span>
              </a>
            </li>
            <li>
              <a
                href="#identifier-masking"
                className={`privacy-toc-link ${activeSection === 'identifier-masking' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('identifier-masking');
                }}
              >
                <EyeOff size={14} />
                <span>5. Masking in Logs & UI</span>
              </a>
            </li>
            <li>
              <a
                href="#retention-policy"
                className={`privacy-toc-link ${activeSection === 'retention-policy' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('retention-policy');
                }}
              >
                <Clock size={14} />
                <span>6. 5-Year Retention Policy</span>
              </a>
            </li>
            <li>
              <a
                href="#encryption"
                className={`privacy-toc-link ${activeSection === 'encryption' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('encryption');
                }}
              >
                <Lock size={14} />
                <span>7. Encryption & Security</span>
              </a>
            </li>
            <li>
              <a
                href="#user-rights"
                className={`privacy-toc-link ${activeSection === 'user-rights' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('user-rights');
                }}
              >
                <Key size={14} />
                <span>8. Your DPDP Rights</span>
              </a>
            </li>
            <li>
              <a
                href="#dpo-contact"
                className={`privacy-toc-link ${activeSection === 'dpo-contact' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('dpo-contact');
                }}
              >
                <Mail size={14} />
                <span>9. Data Protection Officer</span>
              </a>
            </li>
          </ul>
        </aside>

        {/* Content Stream */}
        <main className="privacy-content-stream">
          {/* Section 1: DPDP Act 2023 Compliance */}
          <article id="dpdp-act" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <ShieldCheck size={22} />
              </div>
              <h2 className="privacy-section-h2">1. DPDP Act 2023 Compliance Framework</h2>
            </div>
            <p className="privacy-p">
              The Digital Personal Data Protection Act, 2023 establishes legal obligations for Data Fiduciaries processing
              digital personal data within the territory of India. Bharti Airtel Limited operates as a <strong>Significant
              Data Fiduciary (SDF)</strong> under the guidelines issued by the Data Protection Board of India.
            </p>
            <p className="privacy-p">
              Project Udyam Digital has been engineered with <strong>Privacy-by-Design</strong> principles. We ensure that:
            </p>
            <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
              <li>Every item of data collected has an explicitly declared lawful basis.</li>
              <li>Processing is bounded strictly to fulfillment of telecom and cloud service contracts.</li>
              <li>Data Principals maintain continuous transparency over what records are stored and processed.</li>
              <li>Data is processed exclusively within sovereign Tier-IV data centers located on Indian soil (Nxtra by Airtel).</li>
            </ul>
          </article>

          {/* Section 2: What Data We Collect & Why (Purpose Limitation) */}
          <article id="purpose-limitation" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <FileText size={22} />
              </div>
              <h2 className="privacy-section-h2">2. What Data We Collect & Purpose Limitation</h2>
            </div>
            <p className="privacy-p">
              Under the principle of Purpose Limitation (Section 5 of DPDP Act 2023), personal data is processed solely for
              the specified objective of business verification, optical fibre feasibility assessment, billing, and
              statutory telecom onboarding.
            </p>

            <div className="privacy-table-wrap">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Data Category</th>
                    <th>Specific Fields Collected</th>
                    <th>Legal Purpose</th>
                    <th>Statutory Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Entity Identity</strong></td>
                    <td>GSTIN, Udyam Registration Number, Legal Entity Trade Name</td>
                    <td>Verify MSME legal existence & eligibility for enterprise tariffs</td>
                    <td>GST Act & MSMED Act 2006</td>
                  </tr>
                  <tr>
                    <td><strong>Authorized Signatory</strong></td>
                    <td>Name, Designation, Business Email, Mobile Number</td>
                    <td>Authentication, contract signing, SMS/WhatsApp order milestones</td>
                    <td>DoT CAF Regulations</td>
                  </tr>
                  <tr>
                    <td><strong>Physical Site Location</strong></td>
                    <td>Premises address, PIN code, Floor/Unit number, GPS geo-tag</td>
                    <td>Field technician dispatch, fibre optical terminal routing</td>
                    <td>Contract Performance</td>
                  </tr>
                  <tr>
                    <td><strong>KYC Validation</strong></td>
                    <td>Masked Aadhaar VID, Company PAN hash, Certificate PDF</td>
                    <td>Mandatory Customer Application Form (CAF) e-KYC validation</td>
                    <td>DoT / TRAI Mandate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="privacy-p">
              <strong>Purpose Limitation Guarantee:</strong> Your enterprise data is never repurposed for third-party ad
              networks, external data brokerage, or unsolicited promotional outreach outside your declared product scope.
            </p>
          </article>

          {/* Section 3: Consent Mechanism */}
          <article id="consent-mechanism" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <UserCheck size={22} />
              </div>
              <h2 className="privacy-section-h2">3. Granular Consent & Verifiable Hash</h2>
            </div>
            <p className="privacy-p">
              In strict adherence to Section 6 of the DPDP Act 2023, consent must be free, specific, informed, unconditional,
              and unambiguous. Project Udyam Digital employs a multi-tiered affirmative consent mechanism:
            </p>
            <div className="rights-cards-grid">
              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#22c55e" />
                  Separate Consent Checkpoints
                </h4>
                <p className="right-card-p">
                  We never bundle consent. Registry lookup, credit verification, and WhatsApp order alerts require distinct,
                  unbundled opt-in approvals.
                </p>
              </div>
              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#22c55e" />
                  Cryptographic Timestamp
                </h4>
                <p className="right-card-p">
                  Each consent event generates an immutable SHA-256 hash containing timestamp, client IP, signatory identifier,
                  and consent clause version.
                </p>
              </div>
              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#22c55e" />
                  Right to Withdraw
                </h4>
                <p className="right-card-p">
                  Data Principals may revoke secondary consent (e.g. promotional updates) anytime via the portal without
                  affecting core connectivity services.
                </p>
              </div>
            </div>

            {/* Verifiable Consent Token Simulator */}
            <div className="consent-token-viewer">
              <div className="token-viewer-header">
                <span>Sample Verifiable Consent Proof (SHA-256 Record)</span>
                <span style={{ color: '#22c55e' }}>STATUS: IMMUTABLE_LOGGED</span>
              </div>
              <div className="token-viewer-code">
{`{
  "consent_id": "CONS-2026-992140A",
  "data_principal": "Priyesh Sen (Apex Design Studios LLP)",
  "purpose": "AIRTEL_UDYAM_DIGITAL_ONBOARDING_KYC",
  "timestamp_utc": "2026-07-15T05:00:24.819Z",
  "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "dpdp_section": "Section 6(1), DPDP Act 2023",
  "fiduciary_identifier": "BHARTI_AIRTEL_SDF_001"
}`}
              </div>
            </div>
          </article>

          {/* Section 4: Data Minimization Approach */}
          <article id="data-minimization" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <Sparkles size={22} />
              </div>
              <h2 className="privacy-section-h2">4. Data Minimization Principles</h2>
            </div>
            <p className="privacy-p">
              Traditional enterprise telecom sales demand stacks of photocopied bank statements, physical director photos,
              and utility bills. Project Udyam Digital eliminates document hoarding through automated API verification:
            </p>
            <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Ephemeral Querying:</strong> We query the public GSTIN and MSME Udyam registries via official API
                bridges. We only store the verification certificate token and company trade name, discarding intermediate payloads.
              </li>
              <li>
                <strong>No Bank Account Mirroring:</strong> Automated mandates and invoices use direct NPCI / e-NACH tokens
                without storing raw banking credentials.
              </li>
              <li>
                <strong>No Location Tracking:</strong> Field technician dispatch uses static installation postal coordinates.
                No persistent device geolocation is ever tracked from your browser or office network.
              </li>
            </ul>
          </article>

          {/* Section 5: Identifier Masking in Logs & UI */}
          <article id="identifier-masking" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <EyeOff size={22} />
              </div>
              <h2 className="privacy-section-h2">5. How Identifiers Are Masked in Logs & UI</h2>
            </div>
            <p className="privacy-p">
              To prevent accidental PII leakage across internal dashboards, customer support tooling, and telemetry pipelines,
              all direct identifiers are dynamically masked using cryptographic salt masks:
            </p>

            <div className="privacy-table-wrap">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Identifier</th>
                    <th>Raw Format (Example)</th>
                    <th>UI Presentation Mask</th>
                    <th>Telemetry & Log Mask</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>GSTIN</strong></td>
                    <td><span className="privacy-code-pill">27AABCA1234F1Z5</span></td>
                    <td><span className="privacy-mask-pill">27AAB*****1Z5</span></td>
                    <td><span className="privacy-mask-pill">GST_HASH_8F92</span></td>
                  </tr>
                  <tr>
                    <td><strong>Aadhaar VID</strong></td>
                    <td><span className="privacy-code-pill">9182 3847 1928 4719</span></td>
                    <td><span className="privacy-mask-pill">XXXX-XXXX-4719</span></td>
                    <td><span className="privacy-mask-pill">[REDACTED_UIDAI_TOKEN]</span></td>
                  </tr>
                  <tr>
                    <td><strong>Authorized Mobile</strong></td>
                    <td><span className="privacy-code-pill">+91 98104 58210</span></td>
                    <td><span className="privacy-mask-pill">+91 9810X-XXXX</span></td>
                    <td><span className="privacy-mask-pill">TEL_MASK_981XX</span></td>
                  </tr>
                  <tr>
                    <td><strong>Company PAN</strong></td>
                    <td><span className="privacy-code-pill">AABCA1234F</span></td>
                    <td><span className="privacy-mask-pill">AAB****34F</span></td>
                    <td><span className="privacy-mask-pill">PAN_TOKEN_E91A</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="privacy-p">
              Internal engineers and customer support agents have zero access to plaintext identity documents. Decryption
              keys are secured inside Hardware Security Modules (HSM) with strict dual-custody audit access.
            </p>
          </article>

          {/* Section 6: Document Retention Policy (5 Years per Regulatory) */}
          <article id="retention-policy" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <Clock size={22} />
              </div>
              <h2 className="privacy-section-h2">6. Document Retention Policy (5 Years Regulatory Mandate)</h2>
            </div>
            <p className="privacy-p">
              While the DPDP Act mandates data deletion when the purpose is fulfilled, Section 8(7) explicitly preserves
              retention requirements mandated by specialized sectoral laws.
            </p>
            <p className="privacy-p">
              As a licensed Unified Access Service Provider (UASP), Bharti Airtel is bound by the guidelines of the
              <strong> Department of Telecommunications (DoT)</strong> and <strong>Telecom Regulatory Authority of India (TRAI)</strong>:
            </p>

            <div className="rights-cards-grid">
              <div className="right-card">
                <h4 className="right-card-title">
                  <FileSpreadsheet size={16} color="#ff7875" />
                  CAF & e-KYC Records (5 Years)
                </h4>
                <p className="right-card-p">
                  Customer Application Forms (CAF), proof of identity verification tokens, and business agreements must be
                  preserved for exactly <strong>5 years following service disconnection</strong> per DoT License condition 39.20.
                </p>
              </div>

              <div className="right-card">
                <h4 className="right-card-title">
                  <Clock size={16} color="#ff7875" />
                  Call Detail Records (2 Years)
                </h4>
                <p className="right-card-p">
                  Airtel IQ Cloud PBX and VoIP logs are retained for <strong>2 years</strong> for statutory security audit
                  compliance, after which they are irreversibly overwritten.
                </p>
              </div>

              <div className="right-card">
                <h4 className="right-card-title">
                  <Server size={16} color="#22c55e" />
                  Automated Purge Scheduler
                </h4>
                <p className="right-card-p">
                  Once statutory retention periods lapse, an automated cryptographic zero-fill process purges all archived
                  records with verifiable deletion certificates.
                </p>
              </div>
            </div>
          </article>

          {/* Section 7: Data Encryption at Rest & In Transit */}
          <article id="encryption" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <Lock size={22} />
              </div>
              <h2 className="privacy-section-h2">7. Data Encryption at Rest & In Transit</h2>
            </div>
            <p className="privacy-p">
              Project Udyam Digital implements state-of-the-art cryptographic standards audited under CERT-In empaneled
              security auditors:
            </p>
            <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Data in Transit:</strong> Forced TLS 1.3 encryption across all public web and API endpoints with
                ECDHE forward secrecy and HSTS (Strict-Transport-Security). Weak ciphers are disabled at load balancers.
              </li>
              <li>
                <strong>Data at Rest:</strong> AES-256-GCM authenticated encryption for all databases, object storage blobs,
                and disk volumes. Cryptographic keys are rotated automatically every 90 days via FIPS 140-2 Level 3 HSMs.
              </li>
              <li>
                <strong>Sovereign Cloud Hosting:</strong> All data is housed inside Nxtra by Airtel data centers located in
                Mumbai, Pune, and Manesar, ensuring full data sovereignty within the Republic of India.
              </li>
            </ul>
          </article>

          {/* Section 8: User Rights */}
          <article id="user-rights" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <Key size={22} />
              </div>
              <h2 className="privacy-section-h2">8. Data Principal Rights Under DPDP Act 2023</h2>
            </div>
            <p className="privacy-p">
              As a Data Principal, your authorized business representatives have the following actionable rights:
            </p>

            <div className="rights-cards-grid">
              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#38bdf8" />
                  Right to Access Summary
                </h4>
                <p className="right-card-p">
                  Request a machine-readable summary of all personal data held, processing activities undertaken, and
                  third parties with whom data was shared.
                </p>
              </div>

              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#38bdf8" />
                  Right to Correction & Updating
                </h4>
                <p className="right-card-p">
                  Correct inaccurate or incomplete business identifiers, updated authorized signatories, or amended
                  billing tax credentials without service pause.
                </p>
              </div>

              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#38bdf8" />
                  Right to Grievance Redressal
                </h4>
                <p className="right-card-p">
                  Direct escalation to our designated Data Protection Officer with an enforceable 15-day resolution SLA
                  prior to appealing to the Data Protection Board.
                </p>
              </div>

              <div className="right-card">
                <h4 className="right-card-title">
                  <CheckCircle2 size={16} color="#38bdf8" />
                  Right to Nominate
                </h4>
                <p className="right-card-p">
                  Nominate any other individual to exercise your privacy rights in the event of death or incapacity of
                  the primary authorized enterprise signatory.
                </p>
              </div>
            </div>
          </article>

          {/* Section 9: Data Protection Officer (Fictional DPO) */}
          <article id="dpo-contact" className="privacy-section-card">
            <div className="privacy-section-header">
              <div className="privacy-section-icon">
                <Mail size={22} />
              </div>
              <h2 className="privacy-section-h2">9. Data Protection Officer (DPO) Contact Information</h2>
            </div>
            <p className="privacy-p">
              In accordance with Section 10 of the DPDP Act 2023, Bharti Airtel Limited has designated a senior Data
              Protection Officer to oversee compliance and address Data Principal grievances:
            </p>

            <div className="dpo-contact-box">
              <div className="dpo-avatar">AS</div>
              <div className="dpo-info">
                <h4>Dr. Ananya Sharma, CIPP/A</h4>
                <p>
                  Chief Data Protection Officer & Group Privacy Counsel • Bharti Airtel Limited
                </p>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Airtel Centre, 1st Floor, Tower B, Plot No. 16, Udyog Vihar Phase IV, Gurugram, Haryana 122015
                </div>
                <div className="dpo-contact-links">
                  <a href="mailto:dpo.udyam@airtel.com" className="dpo-link">
                    <Mail size={14} />
                    dpo.udyam@airtel.com
                  </a>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>
                    Acknowledgement SLA: 48 Hours | Resolution: 15 Business Days
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
              Note: For technical connectivity support or billing queries, please access your Live Tracker concierge or
              call 1800-103-4444. The DPO portal handles privacy and data protection rights exclusively.
            </div>
          </article>
        </main>
      </div>

    </div>
  );
}
