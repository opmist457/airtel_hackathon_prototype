import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateGSTINFormat, lookupGSTIN, maskGSTIN } from '../../data/gstinLookup.js';
import { validateUdyamFormat, lookupUdyam, maskUdyam } from '../../data/udyamLookup.js';

/* ────────────────────────────────────────────────────────────
   STEP LABELS
   ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Consent', icon: '🛡️' },
  { id: 2, label: 'GSTIN', icon: '🏢' },
  { id: 3, label: 'Udyam', icon: '🏭' },
  { id: 4, label: 'Documents', icon: '📄' },
  { id: 5, label: 'Summary', icon: '✅' },
];

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function KYCFlow({ quoteData }) {
  const navigate = useNavigate();

  /* ── shared state ── */
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState('forward'); // for slide animation

  /* ── step 1: consent ── */
  const [consentChecked, setConsentChecked] = useState(false);

  /* ── step 2: GSTIN ── */
  const [gstinInput, setGstinInput] = useState('29FGUXG3354T1ZQ');
  const [gstinValidation, setGstinValidation] = useState({ isValid: false, error: null });
  const [gstinResult, setGstinResult] = useState(null);
  const [gstinLoading, setGstinLoading] = useState(false);
  const [gstinError, setGstinError] = useState(null);

  /* ── step 3: Udyam ── */
  const [udyamInput, setUdyamInput] = useState('UDYAM-KR-00-1115424');
  const [udyamValidation, setUdyamValidation] = useState({ isValid: false, error: null });
  const [udyamResult, setUdyamResult] = useState(null);
  const [udyamLoading, setUdyamLoading] = useState(false);
  const [udyamError, setUdyamError] = useState(null);
  const [udyamSkipped, setUdyamSkipped] = useState(false);
  const [crossCheckWarning, setCrossCheckWarning] = useState(null);

  /* ── step 4: documents ── */
  const [documents, setDocuments] = useState({
    gstCert: null,
    udyamCert: null,
    addressProof: null,
    signatoryId: null,
  });
  const [ocrResults, setOcrResults] = useState({});
  const [ocrProcessing, setOcrProcessing] = useState({});

  /* ── step 5 ── */
  const [submitting, setSubmitting] = useState(false);

  /* ────────── real-time GSTIN validation ────────── */
  useEffect(() => {
    if (gstinInput) {
      setGstinValidation(validateGSTINFormat(gstinInput));
    } else {
      setGstinValidation({ isValid: false, error: null });
    }
  }, [gstinInput]);

  /* ────────── real-time Udyam validation ────────── */
  useEffect(() => {
    if (udyamInput) {
      setUdyamValidation(validateUdyamFormat(udyamInput));
    } else {
      setUdyamValidation({ isValid: false, error: null });
    }
  }, [udyamInput]);

  /* ────────── navigation helpers ────────── */
  const goNext = useCallback(() => {
    if (currentStep < 5) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  /* ────────── GSTIN verify ────────── */
  const verifyGSTIN = async () => {
    if (!gstinValidation.isValid) return;
    setGstinLoading(true);
    setGstinError(null);
    setGstinResult(null);
    try {
      const res = await lookupGSTIN(gstinInput);
      if (res.success) {
        setGstinResult(res.data);
      } else {
        setGstinError(res.error);
      }
    } catch (err) {
      setGstinError('Lookup failed. Please try again.');
    } finally {
      setGstinLoading(false);
    }
  };

  /* ────────── Udyam verify ────────── */
  const verifyUdyam = async () => {
    if (!udyamValidation.isValid) return;
    setUdyamLoading(true);
    setUdyamError(null);
    setUdyamResult(null);
    setCrossCheckWarning(null);
    try {
      const res = await lookupUdyam(udyamInput);
      if (res.success) {
        setUdyamResult(res.data);
        // cross-check with GSTIN trade_name
        if (gstinResult) {
          const gTrade = (gstinResult.trade_name || '').toLowerCase().trim();
          const uName = (res.data.enterprise_name || res.data.name || '').toLowerCase().trim();
          if (gTrade && uName && gTrade !== uName) {
            setCrossCheckWarning(
              `Udyam enterprise name "${res.data.enterprise_name || res.data.name}" does not exactly match GSTIN trade name "${gstinResult.trade_name}". Please verify both registrations belong to the same entity.`
            );
          }
        }
      } else {
        setUdyamError(res.error);
      }
    } catch (err) {
      setUdyamError('Lookup failed. Please try again.');
    } finally {
      setUdyamLoading(false);
    }
  };

  /* ────────── Document handling ────────── */
  const handleFileSelect = (docType, file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      return;
    }
    setDocuments((prev) => ({ ...prev, [docType]: file }));
    // Simulate OCR
    setOcrProcessing((prev) => ({ ...prev, [docType]: true }));
    setOcrResults((prev) => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });
    setTimeout(() => {
      setOcrProcessing((prev) => ({ ...prev, [docType]: false }));
      const mockOcr = generateMockOCR(docType);
      setOcrResults((prev) => ({ ...prev, [docType]: mockOcr }));
    }, 1500);
  };

  const generateMockOCR = (docType) => {
    const tradeName = gstinResult?.trade_name || 'Business Name';
    const gstin = gstinResult?.gstin || '';
    const referenceDate = new Date('2026-07-15');
    switch (docType) {
      case 'gstCert':
        return {
          checks: [
            { status: 'pass', label: 'Document type: GST Registration Certificate' },
            { status: 'pass', label: `GSTIN matches: ${maskGSTIN(gstin)}` },
            { status: 'pass', label: `Business name matches: ${tradeName}` },
          ],
        };
      case 'udyamCert':
        return {
          checks: [
            { status: 'pass', label: 'Document type: Udyam Registration Certificate' },
            { status: 'pass', label: `Enterprise name matches: ${udyamResult?.enterprise_name || udyamResult?.name || tradeName}` },
          ],
        };
      case 'addressProof': {
        // Simulate an address proof date 60 days before reference
        const docDate = new Date(referenceDate);
        docDate.setDate(docDate.getDate() - 60);
        const daysDiff = Math.floor((referenceDate - docDate) / (1000 * 60 * 60 * 24));
        const within90 = daysDiff <= 90;
        return {
          checks: [
            { status: 'pass', label: 'Document type: Address Proof detected' },
            { status: 'pass', label: `Address details match registry data` },
            {
              status: within90 ? 'pass' : 'warn',
              label: `Document date: ${docDate.toISOString().split('T')[0]} (${daysDiff} days old — ${within90 ? 'within' : 'exceeds'} 90-day limit)`,
            },
          ],
        };
      }
      case 'signatoryId':
        return {
          checks: [
            { status: 'pass', label: 'Document type: Signatory ID detected' },
            { status: 'pass', label: 'Identity details extracted successfully' },
          ],
        };
      default:
        return { checks: [] };
    }
  };

  /* ────────── Status badge helper ────────── */
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return { icon: '✅', color: '#10B981', label: 'Active' };
    if (s === 'suspended') return { icon: '⚠️', color: '#F59E0B', label: 'Suspended' };
    return { icon: '❌', color: '#EF4444', label: status || 'Cancelled' };
  };

  const getEnterpriseBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'micro') return { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' };
    if (t === 'small') return { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' };
    if (t === 'medium') return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' };
    return { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' };
  };

  const DEMO_PROFILES = {
    happy: {
      gstin: '29FGUXG3354T1ZQ',
      udyam: 'UDYAM-KR-00-1115424',
    },
    cancelled: {
      gstin: '37IHKXV5167L1ZS',
      udyam: 'UDYAM-MH-00-2675962',
    },
    mismatch: {
      gstin: '29FGUXG3354T1ZQ',
      udyam: 'UDYAM-WB-00-5053330',
    },
  };

  const applyDemoProfile = (key) => {
    const profile = DEMO_PROFILES[key];
    if (!profile) return;
    setGstinInput(profile.gstin);
    setGstinResult(null);
    setGstinError(null);
    setUdyamInput(profile.udyam);
    setUdyamResult(null);
    setUdyamError(null);
    setUdyamSkipped(false);
    setCrossCheckWarning(null);
  };

  const loadSpecimenDocuments = async () => {
    const files = {
      gstCert: '/demo/kyc/K03_gst_certificate.png',
      udyamCert: '/demo/kyc/K03_udyam_certificate.png',
      addressProof: '/demo/kyc/K03_address_proof.png',
      signatoryId: '/demo/kyc/K03_signatory_id.png',
    };
    await Promise.all(
      Object.entries(files).map(async ([docType, url]) => {
        const res = await fetch(url);
        const blob = await res.blob();
        const name = url.split('/').pop();
        const file = new File([blob], name, { type: blob.type || 'image/png' });
        handleFileSelect(docType, file);
      })
    );
  };

  /* ────────── submit ────────── */
  const handleSubmit = () => {
    setSubmitting(true);
    const payload = {
      kycComplete: true,
      businessName: gstinResult?.trade_name || gstinResult?.legal_name,
      gstin: gstinResult?.gstin,
      udyam: udyamResult?.udyam_number || null,
      ...(quoteData || {}),
    };
    try {
      sessionStorage.setItem('udyam_kyc', JSON.stringify({
        kycComplete: true,
        businessName: payload.businessName,
        gstin: payload.gstin,
        udyam: payload.udyam,
        selectedProducts: payload.selectedProducts || [],
      }));
    } catch {
      // Ignore storage limits during the demo.
    }
    setTimeout(() => {
      navigate('/tracker', { state: payload });
    }, 1200);
  };

  /* ────────── can proceed check ────────── */
  const canProceed = () => {
    switch (currentStep) {
      case 1: return consentChecked;
      case 2: return !!gstinResult && (gstinResult.status || '').toLowerCase() === 'active';
      case 3: return !!udyamResult || udyamSkipped;
      case 4: {
        const hasGstCert = !!documents.gstCert;
        const hasAddress = !!documents.addressProof;
        const hasSignatory = !!documents.signatoryId;
        return hasGstCert && hasAddress && hasSignatory;
      }
      case 5: return true;
      default: return false;
    }
  };

  /* ────────── drop zone component ────────── */
  const DropZone = ({ docType, label, required = true }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const file = documents[docType];
    const ocr = ocrResults[docType];
    const processing = ocrProcessing[docType];

    const onDrop = (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(docType, f);
    };

    return (
      <div className="upload-zone-wrapper">
        <div className="upload-label-row">
          <span className="upload-label">{label}</span>
          {!required && <span className="upload-optional">Optional</span>}
        </div>
        <div
          className={`upload-dropzone ${dragging ? 'upload-dropzone--dragging' : ''} ${file ? 'upload-dropzone--has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(docType, e.target.files[0])}
          />
          {!file ? (
            <div className="upload-placeholder">
              <span className="upload-icon">📤</span>
              <span className="upload-text">Drag & drop or click to upload</span>
              <span className="upload-hint">PNG, JPG, or PDF</span>
            </div>
          ) : (
            <div className="upload-preview">
              <span className="upload-file-icon">{file.type === 'application/pdf' ? '📋' : '🖼️'}</span>
              <div className="upload-file-info">
                <span className="upload-filename">{file.name}</span>
                <span className="upload-filesize">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                className="upload-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setDocuments((prev) => ({ ...prev, [docType]: null }));
                  setOcrResults((prev) => { const c = { ...prev }; delete c[docType]; return c; });
                }}
              >✕</button>
            </div>
          )}
        </div>
        {/* OCR results */}
        {processing && (
          <div className="upload-ocr-processing">
            <span className="upload-spinner" /> Extracting document data via OCR…
          </div>
        )}
        {ocr && !processing && (
          <div className="upload-ocr-results">
            {ocr.checks.map((c, i) => (
              <div key={i} className={`upload-ocr-check upload-ocr-check--${c.status}`}>
                <span>{c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <>
      <style>{KYC_STYLES}</style>

      {/* ── PROGRESS STEPPER ── */}
      <div className="kyc-stepper">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;
          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div className={`kyc-stepper-line ${isDone ? 'kyc-stepper-line--done' : ''}`} />
              )}
              <div
                className={`kyc-stepper-step ${isActive ? 'kyc-stepper-step--active' : ''} ${isDone ? 'kyc-stepper-step--done' : ''}`}
                onClick={() => {
                  if (isDone) {
                    setDirection(step.id < currentStep ? 'backward' : 'forward');
                    setCurrentStep(step.id);
                  }
                }}
              >
                <div className="kyc-stepper-circle">
                  {isDone ? '✓' : step.icon}
                </div>
                <span className="kyc-stepper-label">{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── STEP CONTENT ── */}
      <div className="kyc-step-container">
        <div className={`kyc-step-slide kyc-step-slide--${direction}`} key={currentStep}>

          {/* ═══════ STEP 1: CONSENT ═══════ */}
          {currentStep === 1 && (
            <div className="kyc-card step-consent">
              <div className="step-header">
                <span className="step-header-icon">🛡️</span>
                <div>
                  <h2 className="step-title">Data Protection Consent</h2>
                  <p className="step-subtitle">DPDP Act 2023 Compliant</p>
                </div>
              </div>

              <div className="consent-notice">
                <div className="consent-section">
                  <h3>🔒 Purpose of Data Collection</h3>
                  <p>We collect your business documents to verify your identity and activate telecom services under Project Udyam Digital. All data handling follows the Digital Personal Data Protection Act, 2023.</p>
                </div>
                <div className="consent-section">
                  <h3>📋 Data Collected</h3>
                  <ul className="consent-list">
                    <li>GSTIN (Goods and Services Tax Identification Number)</li>
                    <li>Udyam Registration Number (MSME Certificate)</li>
                    <li>Address Proof Document</li>
                    <li>Authorized Signatory Identity Document</li>
                  </ul>
                </div>
                <div className="consent-section">
                  <h3>🗄️ Data Retention</h3>
                  <p>Documents are encrypted using AES-256 and retained for 5 years per regulatory requirements. All identifiers are tokenized after verification. You may request data deletion after the mandatory retention period.</p>
                </div>
                <div className="consent-section">
                  <h3>🔐 Security Measures</h3>
                  <ul className="consent-list">
                    <li>End-to-end encryption during transmission</li>
                    <li>Access restricted to authorized verification personnel</li>
                    <li>Audit trail maintained for all data access events</li>
                    <li>Compliant with ISO 27001 and SOC 2 standards</li>
                  </ul>
                </div>
              </div>

              <label className="consent-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="consent-checkbox"
                />
                <span className="consent-checkbox-label">
                  I consent to the collection and processing of my business documents as described above for the purpose of KYC verification and telecom service activation under the DPDP Act 2023.
                </span>
              </label>

              <div className="step-actions">
                <div />
                <button
                  className="kyc-btn kyc-btn--primary"
                  disabled={!consentChecked}
                  onClick={goNext}
                >
                  Proceed to GSTIN Verification →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 2: GSTIN ═══════ */}
          {currentStep === 2 && (
            <div className="kyc-card step-gstin">
              <div className="step-header">
                <span className="step-header-icon">🏢</span>
                <div>
                  <h2 className="step-title">GSTIN Verification</h2>
                  <p className="step-subtitle">Verify against National GST Registry</p>
                </div>
              </div>

              <div className="verification-input-group">
                <label className="verification-label">
                  GSTIN Number
                  <span className="verification-hint">Format: 22AAAAA0000A1Z5</span>
                </label>
                <div className="verification-input-row">
                  <div className="verification-input-wrap">
                    <input
                      type="text"
                      className={`verification-input ${gstinInput && (gstinValidation.isValid ? 'verification-input--valid' : 'verification-input--invalid')}`}
                      value={gstinInput}
                      onChange={(e) => {
                        setGstinInput(e.target.value.toUpperCase());
                        setGstinResult(null);
                        setGstinError(null);
                      }}
                      placeholder="e.g. 32TTNXB7384T1ZW"
                      maxLength={15}
                    />
                    {gstinInput && (
                      <span className={`verification-input-status ${gstinValidation.isValid ? 'verification-input-status--valid' : ''}`}>
                        {gstinValidation.isValid ? '✓' : `${gstinInput.length}/15`}
                      </span>
                    )}
                  </div>
                  <button
                    className="kyc-btn kyc-btn--accent"
                    disabled={!gstinValidation.isValid || gstinLoading}
                    onClick={verifyGSTIN}
                  >
                    {gstinLoading ? (
                      <><span className="kyc-btn-spinner" /> Verifying…</>
                    ) : (
                      '🔍 Verify'
                    )}
                  </button>
                </div>
                {gstinInput && gstinValidation.error && !gstinValidation.isValid && (
                  <p className="verification-error-msg">{gstinValidation.error}</p>
                )}
                {gstinError && (
                  <p className="verification-error-msg">❌ {gstinError}</p>
                )}
                <div className="demo-chip-row">
                  <span>Video demo:</span>
                  <button type="button" className="demo-chip" onClick={() => applyDemoProfile('happy')}>Happy path · Ganesh Woodcraft</button>
                  <button type="button" className="demo-chip" onClick={() => applyDemoProfile('cancelled')}>Catch · Cancelled GSTIN</button>
                  <button type="button" className="demo-chip" onClick={() => applyDemoProfile('mismatch')}>Catch · Name mismatch</button>
                </div>
              </div>

              {/* result card */}
              {gstinResult && (
                <div className="verification-result-card verification-result-card--success">
                  <div className="verification-result-header">
                    <span style={{ fontSize: '1.3rem' }}>{getStatusBadge(gstinResult.status).icon}</span>
                    <h3>GSTIN Verified</h3>
                    <span
                      className="verification-status-badge"
                      style={{
                        background: `${getStatusBadge(gstinResult.status).color}22`,
                        color: getStatusBadge(gstinResult.status).color,
                        border: `1px solid ${getStatusBadge(gstinResult.status).color}44`,
                      }}
                    >
                      {getStatusBadge(gstinResult.status).label}
                    </span>
                  </div>

                  {gstinResult.status && gstinResult.status.toLowerCase() !== 'active' && (
                    <div className="verification-warning-banner">
                      ⚠️ This GSTIN is marked as <strong>{gstinResult.status}</strong>. Services may be restricted for non-active registrations.
                    </div>
                  )}

                  <div className="verification-details-grid">
                    <div className="verification-detail">
                      <span className="verification-detail-label">Masked GSTIN</span>
                      <span className="verification-detail-value verification-detail-value--mono">{maskGSTIN(gstinResult.gstin)}</span>
                    </div>
                    <div className="verification-detail">
                      <span className="verification-detail-label">Legal Name</span>
                      <span className="verification-detail-value">{gstinResult.legal_name}</span>
                    </div>
                    <div className="verification-detail">
                      <span className="verification-detail-label">Trade Name</span>
                      <span className="verification-detail-value">{gstinResult.trade_name}</span>
                    </div>
                    <div className="verification-detail">
                      <span className="verification-detail-label">Constitution</span>
                      <span className="verification-detail-value">{gstinResult.constitution}</span>
                    </div>
                    <div className="verification-detail">
                      <span className="verification-detail-label">State</span>
                      <span className="verification-detail-value">{gstinResult.state}</span>
                    </div>
                    <div className="verification-detail">
                      <span className="verification-detail-label">Registration Date</span>
                      <span className="verification-detail-value">{gstinResult.registration_date}</span>
                    </div>
                    <div className="verification-detail" style={{ gridColumn: '1 / -1' }}>
                      <span className="verification-detail-label">Address</span>
                      <span className="verification-detail-value">{gstinResult.address || gstinResult.principal_place_of_business}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="step-actions">
                <button className="kyc-btn kyc-btn--ghost" onClick={goPrev}>← Back</button>
                <button
                  className="kyc-btn kyc-btn--primary"
                  disabled={!gstinResult}
                  onClick={goNext}
                >
                  Continue to Udyam →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3: UDYAM ═══════ */}
          {currentStep === 3 && (
            <div className="kyc-card step-udyam">
              <div className="step-header">
                <span className="step-header-icon">🏭</span>
                <div>
                  <h2 className="step-title">Udyam Registration Verification</h2>
                  <p className="step-subtitle">MSME Classification Check</p>
                </div>
              </div>

              {!udyamSkipped ? (
                <>
                  <div className="verification-input-group">
                    <label className="verification-label">
                      Udyam Number
                      <span className="verification-hint">Format: UDYAM-XX-00-NNNNNNN</span>
                    </label>
                    <div className="verification-input-row">
                      <div className="verification-input-wrap">
                        <input
                          type="text"
                          className={`verification-input ${udyamInput && (udyamValidation.isValid ? 'verification-input--valid' : 'verification-input--invalid')}`}
                          value={udyamInput}
                          onChange={(e) => {
                            setUdyamInput(e.target.value.toUpperCase());
                            setUdyamResult(null);
                            setUdyamError(null);
                            setCrossCheckWarning(null);
                          }}
                          placeholder="e.g. UDYAM-KL-00-3078801"
                          maxLength={22}
                        />
                        {udyamInput && (
                          <span className={`verification-input-status ${udyamValidation.isValid ? 'verification-input-status--valid' : ''}`}>
                            {udyamValidation.isValid ? '✓' : ''}
                          </span>
                        )}
                      </div>
                      <button
                        className="kyc-btn kyc-btn--accent"
                        disabled={!udyamValidation.isValid || udyamLoading}
                        onClick={verifyUdyam}
                      >
                        {udyamLoading ? (
                          <><span className="kyc-btn-spinner" /> Verifying…</>
                        ) : (
                          '🔍 Verify'
                        )}
                      </button>
                    </div>
                    {udyamInput && udyamValidation.error && !udyamValidation.isValid && (
                      <p className="verification-error-msg">{udyamValidation.error}</p>
                    )}
                    {udyamError && (
                      <p className="verification-error-msg">❌ {udyamError}</p>
                    )}
                  </div>

                  {crossCheckWarning && (
                    <div className="verification-warning-banner" style={{ marginBottom: '1rem' }}>
                      ⚠️ {crossCheckWarning}
                    </div>
                  )}

                  {udyamResult && (
                    <div className="verification-result-card verification-result-card--success">
                      <div className="verification-result-header">
                        <span style={{ fontSize: '1.3rem' }}>✅</span>
                        <h3>Udyam Verified</h3>
                        {(() => {
                          const badge = getEnterpriseBadge(udyamResult.enterprise_type || udyamResult.type);
                          return (
                            <span
                              className="verification-status-badge"
                              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}44` }}
                            >
                              {udyamResult.enterprise_type || udyamResult.type} Enterprise
                            </span>
                          );
                        })()}
                      </div>
                      <div className="verification-details-grid">
                        <div className="verification-detail">
                          <span className="verification-detail-label">Masked Udyam</span>
                          <span className="verification-detail-value verification-detail-value--mono">{maskUdyam(udyamResult.udyam_number)}</span>
                        </div>
                        <div className="verification-detail">
                          <span className="verification-detail-label">Enterprise Name</span>
                          <span className="verification-detail-value">{udyamResult.enterprise_name || udyamResult.name}</span>
                        </div>
                        <div className="verification-detail">
                          <span className="verification-detail-label">Major Activity</span>
                          <span className="verification-detail-value">{udyamResult.major_activity}</span>
                        </div>
                        <div className="verification-detail">
                          <span className="verification-detail-label">State</span>
                          <span className="verification-detail-value">{udyamResult.state}</span>
                        </div>
                        <div className="verification-detail">
                          <span className="verification-detail-label">City</span>
                          <span className="verification-detail-value">{udyamResult.city}</span>
                        </div>
                        <div className="verification-detail">
                          <span className="verification-detail-label">Registration Date</span>
                          <span className="verification-detail-value">{udyamResult.registration_date || udyamResult.date_of_registration}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="step-skip-row">
                    <button className="kyc-btn kyc-btn--link" onClick={() => setUdyamSkipped(true)}>
                      Skip — I don't have Udyam registration
                    </button>
                  </div>
                </>
              ) : (
                <div className="verification-skipped-banner">
                  <span>ℹ️</span>
                  <div>
                    <strong>Udyam verification skipped</strong>
                    <p>You can complete MSME registration later. This will not block KYC approval, but some MSME-specific benefits may not apply.</p>
                  </div>
                  <button className="kyc-btn kyc-btn--link" onClick={() => setUdyamSkipped(false)}>Undo</button>
                </div>
              )}

              <div className="step-actions">
                <button className="kyc-btn kyc-btn--ghost" onClick={goPrev}>← Back</button>
                <button
                  className="kyc-btn kyc-btn--primary"
                  disabled={!udyamResult && !udyamSkipped}
                  onClick={goNext}
                >
                  Continue to Documents →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 4: DOCUMENTS ═══════ */}
          {currentStep === 4 && (
            <div className="kyc-card step-documents">
              <div className="step-header">
                <span className="step-header-icon">📄</span>
                <div>
                  <h2 className="step-title">Document Upload & OCR Verification</h2>
                  <p className="step-subtitle">Upload supporting documents for verification</p>
                </div>
                <button type="button" className="kyc-btn kyc-btn--ghost" onClick={loadSpecimenDocuments}>
                  Load K03 specimen pack
                </button>
              </div>

              <div className="upload-grid">
                <DropZone docType="gstCert" label="GST Registration Certificate" required />
                <DropZone docType="udyamCert" label="Udyam Registration Certificate" required={false} />
                <DropZone docType="addressProof" label="Address Proof (Utility Bill / Bank Statement)" required />
                <DropZone docType="signatoryId" label="Authorized Signatory ID (Aadhaar / PAN / Passport)" required />
              </div>

              <div className="step-actions">
                <button className="kyc-btn kyc-btn--ghost" onClick={goPrev}>← Back</button>
                <button
                  className="kyc-btn kyc-btn--primary"
                  disabled={!canProceed()}
                  onClick={goNext}
                >
                  Review Summary →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 5: SUMMARY ═══════ */}
          {currentStep === 5 && (
            <div className="kyc-card step-summary">
              <div className="step-header">
                <span className="step-header-icon">✅</span>
                <div>
                  <h2 className="step-title">KYC Verification Summary</h2>
                  <p className="step-subtitle">Review all verified information before submission</p>
                </div>
              </div>

              {/* verification score */}
              <div className="summary-score">
                <div className="summary-score-circle">
                  <span className="summary-score-value">
                    {(
                      (gstinResult ? 1 : 0) +
                      (udyamResult ? 1 : 0) +
                      (documents.gstCert ? 1 : 0) +
                      (documents.addressProof ? 1 : 0) +
                      (documents.signatoryId ? 1 : 0)
                    )}/{(udyamSkipped ? 4 : 5)}
                  </span>
                  <span className="summary-score-label">Checks Passed</span>
                </div>
                <div className="summary-score-status">
                  {(() => {
                    const total = udyamSkipped ? 4 : 5;
                    const passed = (gstinResult ? 1 : 0) + (udyamResult ? 1 : 0) + (documents.gstCert ? 1 : 0) + (documents.addressProof ? 1 : 0) + (documents.signatoryId ? 1 : 0);
                    if (passed >= total) return <><span style={{ color: '#10B981', fontSize: '1.4rem' }}>✅</span><span>All Verifications Passed</span></>;
                    return <><span style={{ color: '#F59E0B', fontSize: '1.4rem' }}>⚠️</span><span>Partial Verification</span></>;
                  })()}
                </div>
              </div>

              {/* summary sections */}
              <div className="summary-sections">
                {/* GSTIN */}
                <div className="summary-section">
                  <div className="summary-section-header">
                    <span>✅</span>
                    <h4>GSTIN Verification</h4>
                  </div>
                  {gstinResult && (
                    <div className="summary-details">
                      <div className="summary-row"><span>GSTIN</span><span className="mono">{maskGSTIN(gstinResult.gstin)}</span></div>
                      <div className="summary-row"><span>Legal Name</span><span>{gstinResult.legal_name}</span></div>
                      <div className="summary-row"><span>Trade Name</span><span>{gstinResult.trade_name}</span></div>
                      <div className="summary-row"><span>Constitution</span><span>{gstinResult.constitution}</span></div>
                      <div className="summary-row"><span>Status</span><span style={{ color: getStatusBadge(gstinResult.status).color }}>{gstinResult.status}</span></div>
                    </div>
                  )}
                </div>

                {/* Udyam */}
                <div className="summary-section">
                  <div className="summary-section-header">
                    <span>{udyamResult ? '✅' : udyamSkipped ? 'ℹ️' : '⏭️'}</span>
                    <h4>Udyam Verification</h4>
                    {udyamSkipped && <span className="summary-skipped-badge">Skipped</span>}
                  </div>
                  {udyamResult && (
                    <div className="summary-details">
                      <div className="summary-row"><span>Udyam Number</span><span className="mono">{maskUdyam(udyamResult.udyam_number)}</span></div>
                      <div className="summary-row"><span>Enterprise Name</span><span>{udyamResult.enterprise_name || udyamResult.name}</span></div>
                      <div className="summary-row"><span>Type</span><span>{udyamResult.enterprise_type || udyamResult.type}</span></div>
                      <div className="summary-row"><span>Activity</span><span>{udyamResult.major_activity}</span></div>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="summary-section">
                  <div className="summary-section-header">
                    <span>✅</span>
                    <h4>Documents Uploaded</h4>
                  </div>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>GST Certificate</span>
                      <span style={{ color: documents.gstCert ? '#10B981' : '#EF4444' }}>
                        {documents.gstCert ? `✅ ${documents.gstCert.name}` : '❌ Missing'}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Udyam Certificate</span>
                      <span style={{ color: documents.udyamCert ? '#10B981' : '#94A3B8' }}>
                        {documents.udyamCert ? `✅ ${documents.udyamCert.name}` : '— Optional'}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Address Proof</span>
                      <span style={{ color: documents.addressProof ? '#10B981' : '#EF4444' }}>
                        {documents.addressProof ? `✅ ${documents.addressProof.name}` : '❌ Missing'}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Signatory ID</span>
                      <span style={{ color: documents.signatoryId ? '#10B981' : '#EF4444' }}>
                        {documents.signatoryId ? `✅ ${documents.signatoryId.name}` : '❌ Missing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button className="kyc-btn kyc-btn--ghost" onClick={goPrev}>← Back</button>
                <button
                  className="kyc-btn kyc-btn--submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="kyc-btn-spinner" /> Submitting KYC…</>
                  ) : (
                    '🚀 Submit KYC & Proceed to Tracker'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   EMBEDDED CSS
   ════════════════════════════════════════════════════════════ */
const KYC_STYLES = `
/* ── animations ── */
@keyframes kycSlideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes kycSlideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes kycFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes kycSpin {
  to { transform: rotate(360deg); }
}
@keyframes kycPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

/* ── stepper ── */
.kyc-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: rgba(18, 22, 33, 0.65);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}
.kyc-stepper-line {
  flex: 1;
  max-width: 80px;
  height: 2px;
  background: rgba(255,255,255,0.1);
  transition: background 0.4s;
}
.kyc-stepper-line--done {
  background: #10B981;
}
.kyc-stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  cursor: default;
  transition: all 0.3s;
}
.kyc-stepper-step--done {
  cursor: pointer;
}
.kyc-stepper-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: rgba(255,255,255,0.04);
  border: 2px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
}
.kyc-stepper-step--active .kyc-stepper-circle {
  border-color: #ED1C24;
  background: rgba(237,28,36,0.15);
  box-shadow: 0 0 20px rgba(237,28,36,0.3);
}
.kyc-stepper-step--done .kyc-stepper-circle {
  border-color: #10B981;
  background: rgba(16,185,129,0.15);
  color: #10B981;
  font-weight: 700;
}
.kyc-stepper-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: color 0.3s;
}
.kyc-stepper-step--active .kyc-stepper-label {
  color: #ED1C24;
  font-weight: 600;
}
.kyc-stepper-step--done .kyc-stepper-label {
  color: #10B981;
}

/* ── step container & slide ── */
.kyc-step-container {
  position: relative;
  overflow: hidden;
}
.kyc-step-slide--forward {
  animation: kycSlideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.kyc-step-slide--backward {
  animation: kycSlideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ── card ── */
.kyc-card {
  background: rgba(18, 22, 33, 0.75);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
}

/* ── step header ── */
.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.step-header-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(237,28,36,0.1);
  border: 1px solid rgba(237,28,36,0.2);
  border-radius: 14px;
  flex-shrink: 0;
}
.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.3;
}
.step-subtitle {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.5);
  margin: 0.2rem 0 0;
}

/* ── consent ── */
.consent-notice {
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1.75rem;
  margin-bottom: 1.75rem;
  max-height: 380px;
  overflow-y: auto;
}
.consent-notice::-webkit-scrollbar {
  width: 5px;
}
.consent-notice::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}
.consent-section {
  margin-bottom: 1.25rem;
}
.consent-section:last-child {
  margin-bottom: 0;
}
.consent-section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem;
}
.consent-section p {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.65;
  margin: 0;
}
.consent-list {
  margin: 0;
  padding-left: 1.25rem;
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  line-height: 1.8;
}
.consent-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  background: rgba(237,28,36,0.06);
  border: 1px solid rgba(237,28,36,0.15);
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s, background 0.2s;
}
.consent-checkbox-wrapper:hover {
  border-color: rgba(237,28,36,0.35);
  background: rgba(237,28,36,0.1);
}
.consent-checkbox {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: #ED1C24;
  flex-shrink: 0;
  cursor: pointer;
}
.consent-checkbox-label {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.55;
}

/* ── verification input ── */
.verification-input-group {
  margin-bottom: 1.75rem;
}
.verification-label {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.6rem;
}
.verification-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255,255,255,0.35);
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.verification-input-row {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
}
.verification-input-wrap {
  flex: 1;
  position: relative;
}
.verification-input {
  width: 100%;
  padding: 0.85rem 3rem 0.85rem 1.15rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.35);
  border: 1.5px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 1.05rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0.06em;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
  box-sizing: border-box;
}
.verification-input:focus {
  border-color: rgba(237,28,36,0.5);
  box-shadow: 0 0 0 3px rgba(237,28,36,0.12);
}
.verification-input--valid {
  border-color: rgba(16,185,129,0.5);
}
.verification-input--valid:focus {
  box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
}
.verification-input--invalid {
  border-color: rgba(239,68,68,0.4);
}
.verification-input-status {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  color: rgba(255,255,255,0.3);
  font-family: 'SF Mono', monospace;
}
.verification-input-status--valid {
  color: #10B981;
  font-size: 1.1rem;
  font-weight: 700;
}
.verification-error-msg {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  color: #EF4444;
}

/* ── result card ── */
.verification-result-card {
  border-radius: 14px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  animation: kycFadeIn 0.4s ease;
}
.verification-result-card--success {
  background: rgba(16,185,129,0.06);
  border: 1px solid rgba(16,185,129,0.2);
}
.verification-result-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}
.verification-result-header h3 {
  font-size: 1.1rem;
  color: #fff;
  margin: 0;
  flex: 1;
}
.verification-status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.verification-warning-banner {
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  font-size: 0.85rem;
  color: #F59E0B;
  margin-bottom: 1rem;
  line-height: 1.5;
}
.verification-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.verification-detail {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.verification-detail-label {
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.verification-detail-value {
  font-size: 0.92rem;
  font-weight: 500;
  color: #fff;
  word-break: break-word;
}
.verification-detail-value--mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0.06em;
  color: #67E8F9;
}

/* ── verification skipped ── */
.verification-skipped-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  animation: kycFadeIn 0.3s ease;
}
.verification-skipped-banner span:first-child {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.verification-skipped-banner strong {
  display: block;
  color: #fff;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}
.verification-skipped-banner p {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.5;
}

/* ── skip row ── */
.step-skip-row {
  text-align: center;
  margin-bottom: 1rem;
}

/* ── step actions ── */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: 0.5rem;
}

/* ── buttons ── */
.kyc-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
  white-space: nowrap;
}
.kyc-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.kyc-btn--primary {
  background: linear-gradient(135deg, #ED1C24, #c41820);
  color: #fff;
  box-shadow: 0 4px 15px rgba(237,28,36,0.25);
}
.kyc-btn--primary:not(:disabled):hover {
  box-shadow: 0 6px 24px rgba(237,28,36,0.4);
  transform: translateY(-1px);
}
.kyc-btn--accent {
  background: rgba(237,28,36,0.12);
  color: #ED1C24;
  border: 1px solid rgba(237,28,36,0.3);
}
.kyc-btn--accent:not(:disabled):hover {
  background: rgba(237,28,36,0.2);
}
.kyc-btn--ghost {
  background: transparent;
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}
.kyc-btn--ghost:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.8);
}
.kyc-btn--link {
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  text-decoration: underline;
  font-size: 0.85rem;
  padding: 0.5rem;
  cursor: pointer;
}
.kyc-btn--link:hover {
  color: rgba(255,255,255,0.7);
}
.kyc-btn--submit {
  background: linear-gradient(135deg, #10B981, #059669);
  color: #fff;
  box-shadow: 0 4px 15px rgba(16,185,129,0.3);
  font-size: 0.95rem;
  padding: 0.85rem 2rem;
}
.kyc-btn--submit:not(:disabled):hover {
  box-shadow: 0 6px 24px rgba(16,185,129,0.45);
  transform: translateY(-1px);
}
.kyc-btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: kycSpin 0.6s linear infinite;
}

/* ── upload ── */
.upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.upload-zone-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.upload-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.upload-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
}
.upload-optional {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.05);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}
.upload-dropzone {
  border: 2px dashed rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 1.5rem;
  background: rgba(0,0,0,0.2);
  cursor: pointer;
  transition: all 0.25s;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-dropzone:hover {
  border-color: rgba(237,28,36,0.3);
  background: rgba(237,28,36,0.04);
}
.upload-dropzone--dragging {
  border-color: #ED1C24;
  background: rgba(237,28,36,0.08);
  box-shadow: 0 0 20px rgba(237,28,36,0.15);
}
.upload-dropzone--has-file {
  border-style: solid;
  border-color: rgba(16,185,129,0.25);
  background: rgba(16,185,129,0.04);
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}
.upload-icon {
  font-size: 1.8rem;
  opacity: 0.6;
}
.upload-text {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
}
.upload-hint {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.25);
}
.upload-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}
.upload-file-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}
.upload-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.upload-filename {
  font-size: 0.82rem;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upload-filesize {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.35);
}
.upload-remove {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: #EF4444;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.upload-remove:hover {
  background: rgba(239,68,68,0.3);
}

/* ── OCR ── */
.upload-ocr-processing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.45);
  animation: kycPulse 1.5s infinite;
}
.upload-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: #ED1C24;
  border-radius: 50%;
  animation: kycSpin 0.8s linear infinite;
}
.upload-ocr-results {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  animation: kycFadeIn 0.3s ease;
}
.upload-ocr-check {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
}
.upload-ocr-check--pass {
  color: #10B981;
  background: rgba(16,185,129,0.06);
}
.upload-ocr-check--warn {
  color: #F59E0B;
  background: rgba(245,158,11,0.06);
}
.upload-ocr-check--fail {
  color: #EF4444;
  background: rgba(239,68,68,0.06);
}

/* ── summary ── */
.summary-score {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(16,185,129,0.06);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: 14px;
  margin-bottom: 2rem;
}
.summary-score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(16,185,129,0.12);
  border: 2px solid rgba(16,185,129,0.3);
  flex-shrink: 0;
}
.summary-score-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #10B981;
}
.summary-score-label {
  font-size: 0.58rem;
  color: rgba(16,185,129,0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.summary-score-status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.summary-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.summary-section {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 1.25rem;
}
.summary-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}
.summary-section-header h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #fff;
  flex: 1;
}
.summary-skipped-badge {
  font-size: 0.7rem;
  background: rgba(59,130,246,0.15);
  color: #3B82F6;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: 500;
}
.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.84rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.summary-row:last-child {
  border-bottom: none;
}
.summary-row span:first-child {
  color: rgba(255,255,255,0.45);
}
.summary-row span:last-child {
  color: #fff;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
.summary-row .mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0.04em;
  color: #67E8F9;
}

/* ── responsive ── */
@media (max-width: 640px) {
  .kyc-card {
    padding: 1.5rem;
    border-radius: 14px;
  }
  .kyc-stepper {
    padding: 0.85rem 0.75rem;
    gap: 0;
  }
  .kyc-stepper-circle {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  .kyc-stepper-label {
    font-size: 0.6rem;
  }
  .kyc-stepper-line {
    max-width: 40px;
  }
  .verification-input-row {
    flex-direction: column;
  }
  .upload-grid {
    grid-template-columns: 1fr;
  }
  .step-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  .step-actions .kyc-btn {
    width: 100%;
    justify-content: center;
  }
  .summary-score {
    flex-direction: column;
    text-align: center;
  }
}
.step-header > .kyc-btn { margin-left: auto; flex-shrink: 0; }
.demo-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.55);
}
.demo-chip {
  background: rgba(237,28,36,0.12);
  border: 1px solid rgba(237,28,36,0.35);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.demo-chip:hover { background: rgba(237,28,36,0.22); }
`;
