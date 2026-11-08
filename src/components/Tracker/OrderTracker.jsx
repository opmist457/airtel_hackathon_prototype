import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Truck,
  Wrench,
  Zap,
  PhoneCall,
  ShieldCheck,
  Package,
  MapPin,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  ChevronRight,
  User,
  Info,
  BellRing,
  RotateCcw
} from 'lucide-react';
import './OrderTracker.css';

/**
 * Stage definition metadata
 */
const DEFAULT_STAGE_CONFIG = [
  {
    id: 'order_placed',
    title: 'Order Placed',
    icon: Package,
    shortName: 'Placed',
    offsetDays: 0,
    timeOfDay: '10:30 AM',
    desc: 'Digital bundle agreement signed and order confirmation registered in Airtel CRM.'
  },
  {
    id: 'doc_verified',
    title: 'Document Verified',
    icon: ShieldCheck,
    shortName: 'Verified',
    offsetDays: 1,
    timeOfDay: '02:15 PM',
    desc: 'Automated GSTIN and Udyam registry check completed. Authorized signatory e-KYC verified.'
  },
  {
    id: 'install_scheduled',
    title: 'Installation Scheduled',
    icon: Calendar,
    shortName: 'Scheduled',
    offsetDays: 2,
    timeOfDay: '09:45 AM',
    desc: 'Field engineering slot booked. Dedicated installation specialist assigned for site survey and wiring.'
  },
  {
    id: 'equipment_shipped',
    title: 'Equipment Shipped',
    icon: Truck,
    shortName: 'Shipped',
    offsetDays: 3,
    timeOfDay: '04:00 PM',
    desc: 'Airtel Wi-Fi 6 Business Gateway, Optical Terminal, and IoT hardware dispatched from logistics hub.'
  },
  {
    id: 'install_complete',
    title: 'Installation Complete',
    icon: Wrench,
    shortName: 'Installed',
    offsetDays: 4,
    timeOfDay: '03:30 PM',
    desc: 'Fibre spliced into terminal point, signal dBm verified (< -18 dBm), internal Wi-Fi 6 mesh configured.'
  },
  {
    id: 'service_activated',
    title: 'Service Activated',
    icon: Zap,
    shortName: 'Activated',
    offsetDays: 5,
    timeOfDay: '11:00 AM',
    desc: 'Static IP routed, 99.9% uptime SLA live, welcome kit and executive support line enabled.'
  }
];

/**
 * Format Date helper
 */
const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (dateObj, includeTime = false, timeStr = '') => {
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  if (includeTime && timeStr) {
    return `${day} ${month} ${year}, ${timeStr}`;
  }
  return `${day} ${month} ${year}`;
};

/**
 * OrderTracker Component
 * 
 * @param {Object} props
 * @param {string} props.orderId - Unique order tracking identifier
 * @param {string} props.orderDate - Base order date (default: '2026-07-15')
 * @param {number} props.currentStageIndex - Active stage (default: 2 -> 'Installation Scheduled')
 * @param {Object} props.orderBundle - Custom bundle details or fallback mock
 */
export default function OrderTracker({
  orderId = 'UDY-2026-8842',
  orderDate = '2026-07-15',
  currentStageIndex: initialStageIndex = 2,
  orderBundle: customBundle = null
}) {
  // Current active stage state (supports interactive demo stage switching for judges)
  const [activeStageIdx, setActiveStageIdx] = useState(initialStageIndex);
  const [typicalInstallDays, setTypicalInstallDays] = useState(5);
  const [productsCatalogue, setProductsCatalogue] = useState([]);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow, 10:00 AM - 01:00 PM');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Default Mock Bundle (Apex Design Studios)
  const defaultBundle = {
    orderId,
    orderDate,
    customerName: 'Priyesh Sen',
    companyName: 'Apex Design Studios LLP',
    gstin: '27AABCA1234F1Z5',
    siteAddress: 'Unit 402, 4th Floor, Apex Towers, Bandra Kurla Complex, Mumbai, MH 400051',
    contactPhone: '+91 98200-84729',
    manager: {
      name: 'Priya Mehra',
      title: 'Senior Enterprise Onboarding Concierge',
      circle: 'Mumbai Enterprise Circle',
      phone: '+91 98200-EXPRT',
      email: 'priya.mehra@airtel.com'
    },
    engineer: {
      name: 'Ramesh Kumar',
      role: 'Lead Field Fiber Specialist (L2)',
      phone: '+91 98104-58210',
      visitSlot: 'Sat, 18 Jul 2026 • 10:00 AM - 01:00 PM',
      otpCode: '492-108'
    },
    items: [
      {
        id: 'P02',
        name: 'Biz Fibre 300',
        category: 'Connectivity',
        desc: '300 Mbps symmetrical, unlimited data + 1 Static IP',
        price: 1499,
        installDays: 5
      },
      {
        id: 'P09',
        name: 'Airtel IQ Smart IVR',
        category: 'Cloud Communications',
        desc: 'Cloud call management, 5 agent virtual lines & CRM webhook',
        price: 1299,
        installDays: 3
      },
      {
        id: 'P11',
        name: 'Airtel Cloud CCTV 360°',
        category: 'Surveillance & AI',
        desc: '2 HD Dome cameras, AI intrusion detection & 30-day cloud backup',
        price: 999,
        installDays: 4
      },
      {
        id: 'P16',
        name: 'Secure Internet Gateway',
        category: 'Cybersecurity',
        desc: 'DNS-layer threat filtration, malware defense & weekly audit',
        price: 799,
        installDays: 2
      }
    ]
  };

  const bundle = {
    ...defaultBundle,
    ...(customBundle || {}),
    items: customBundle?.items?.length ? customBundle.items : defaultBundle.items,
    manager: { ...defaultBundle.manager, ...(customBundle?.manager || {}) },
    engineer: { ...defaultBundle.engineer, ...(customBundle?.engineer || {}) },
  };

  // Load products catalog if available to calculate dynamic typical_install_days
  useEffect(() => {
    fetch('/data/products.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProductsCatalogue(data);
          // Look up install days for bundle items
          const itemIds = bundle.items.map((i) => i.id);
          const matched = data.filter((p) => itemIds.includes(p.product_id));
          if (matched.length > 0) {
            const maxDays = Math.max(...matched.map((m) => m.typical_install_days || 5));
            setTypicalInstallDays(maxDays);
          }
        }
      })
      .catch(() => {
        // Fallback to max days from bundle items
        const maxDays = Math.max(...bundle.items.map((i) => i.installDays || 5));
        setTypicalInstallDays(maxDays || 5);
      });
  }, [bundle]);

  // Dynamic calculations
  const baseDate = new Date(orderDate);
  const expectedActivationDate = addDays(baseDate, typicalInstallDays);

  // Calculate timeline stages with dates mapped to install days
  const stages = DEFAULT_STAGE_CONFIG.map((cfg, index) => {
    // Map offset days relative to typicalInstallDays
    let dayOffset = 0;
    if (index === 0) dayOffset = 0;
    else if (index === 1) dayOffset = 1;
    else if (index === 2) dayOffset = 2;
    else if (index === 3) dayOffset = Math.max(2, Math.floor(typicalInstallDays * 0.6));
    else if (index === 4) dayOffset = Math.max(3, typicalInstallDays - 1);
    else if (index === 5) dayOffset = typicalInstallDays;

    const stageDate = addDays(baseDate, dayOffset);

    let status = 'pending';
    if (index < activeStageIdx) {
      status = 'completed';
    } else if (index === activeStageIdx) {
      status = 'current';
    }

    const isDoneOrCurrent = index <= activeStageIdx;
    const formattedDate = formatDate(
      stageDate,
      isDoneOrCurrent,
      isDoneOrCurrent ? cfg.timeOfDay : ''
    );

    return {
      ...cfg,
      index,
      status,
      dateFormatted: formattedDate,
      rawDate: stageDate
    };
  });

  // Calculate overall progress percentage
  const progressPercent = Math.round(((activeStageIdx + 0.5) / stages.length) * 100);
  const currentStageObj = stages[activeStageIdx] || stages[0];

  // Pricing calculations
  const monthlySubtotal = bundle.items.reduce((acc, curr) => acc + curr.price, 0);
  const gstAmount = Math.round(monthlySubtotal * 0.18);
  const monthlyTotal = monthlySubtotal + gstAmount;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard?.writeText(bundle.orderId);
    triggerToast(`Order ID ${bundle.orderId} copied to clipboard!`);
  };

  const handleConfirmReschedule = () => {
    setIsRescheduleOpen(false);
    triggerToast(`Engineer visit successfully rescheduled to ${selectedSlot}`);
  };

  return (
    <div className="tracker-container">
      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #ED1C24',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(237, 28, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem'
          }}
        >
          <Sparkles size={18} color="#ED1C24" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Meta */}
      <div className="tracker-header">
        <div className="tracker-badge-row">
          <span className="tracker-badge live-dot">Airtel Accel Live Tracker</span>
          <span className="tracker-id-badge" onClick={handleCopyOrderId} style={{ cursor: 'pointer' }} title="Click to copy">
            Order Ref: <strong>{bundle.orderId}</strong>
          </span>
          <span className="tracker-id-badge">
            SLA: <strong style={{ color: '#22c55e' }}>{typicalInstallDays} Days Activation</strong>
          </span>
        </div>

        <h1 className="tracker-title">
          <span className="tracker-title-gradient">Real-Time Order & Activation Status</span>
        </h1>
        <p className="tracker-subtitle">
          Track end-to-end rollout milestones for <strong>{bundle.companyName}</strong>. Our automated telecom stack
          deploys your connectivity, cloud communications, and hardware with zero physical friction.
        </p>
      </div>

      {/* Overall Progress Percentage Card */}
      <div className="tracker-progress-card">
        <div className="tracker-progress-top">
          <div className="tracker-progress-info">
            <h4>Overall Activation Progress</h4>
            <div className="tracker-progress-current-title">
              <span>Stage {activeStageIdx + 1} of {stages.length}: {currentStageObj.title}</span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ff4d4f',
                  padding: '2px 8px',
                  background: 'rgba(237, 28, 36, 0.15)',
                  borderRadius: '4px'
                }}
              >
                {progressPercent}% Complete
              </span>
            </div>
          </div>

          <div className="tracker-eta-pill">
            <Calendar size={18} color="#ff4d4f" />
            <span>
              Expected Go-Live: <strong>{formatDate(expectedActivationDate)}</strong>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="tracker-bar-wrap">
          <div className="tracker-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Mini Stage Pills */}
        <div className="tracker-pills-row">
          {stages.map((stg, i) => (
            <div
              key={stg.id}
              className={`tracker-pill-item ${stg.status === 'completed' ? 'done' : ''} ${
                stg.status === 'current' ? 'active' : ''
              }`}
            >
              {stg.status === 'completed' ? (
                <CheckCircle2 size={13} />
              ) : stg.status === 'current' ? (
                <Clock size={13} />
              ) : (
                <span>{i + 1}.</span>
              )}
              <span>{stg.shortName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reassurance Banner */}
      <div className="tracker-reassurance-banner">
        <div className="tracker-reassurance-left">
          <div className="tracker-reassurance-icon">
            <BellRing size={20} />
          </div>
          <div className="tracker-reassurance-text">
            <h5>No need to call — we'll update you at each step</h5>
            <p>
              Automated milestone alerts are broadcast directly via WhatsApp and SMS to <strong>{bundle.contactPhone}</strong>.
            </p>
          </div>
        </div>
        <div className="tracker-reassurance-right">
          <div className="tracker-notif-chip">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span>SMS & WhatsApp Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Vertical Timeline + Sidebar Cards */}
      <div className="tracker-main-grid">
        {/* LEFT COLUMN: Vertical Timeline */}
        <div className="timeline-card">
          <div className="timeline-header-row">
            <h3 className="timeline-header-title">
              <Clock size={18} color="#ED1C24" />
              Activation Timeline
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Base install target: <strong>{typicalInstallDays} business days</strong>
            </span>
          </div>

          <div className="timeline-stages-wrapper">
            {/* Continuous Vertical Connector Line */}
            <div className="timeline-track-line">
              <div
                className="timeline-track-fill"
                style={{
                  height: `${(activeStageIdx / (stages.length - 1)) * 100}%`
                }}
              />
            </div>

            {/* Stages Loop */}
            {stages.map((stage) => {
              const IconComponent = stage.icon;
              const isCurrent = stage.status === 'current';
              const isCompleted = stage.status === 'completed';

              return (
                <div
                  key={stage.id}
                  className={`stage-item stage-${stage.status}`}
                >
                  {/* Stage Icon Node */}
                  <div className="stage-node">
                    {isCompleted ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <IconComponent size={20} />
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="stage-content">
                    <div className="stage-header">
                      <div className="stage-title-wrap">
                        <h4 className="stage-title">{stage.title}</h4>
                        <span className="stage-status-badge">
                          {stage.status === 'completed'
                            ? 'Completed'
                            : stage.status === 'current'
                            ? 'In Progress'
                            : 'Expected'}
                        </span>
                      </div>
                      <span className="stage-date">
                        {stage.status === 'pending' ? 'Expected ' : ''}
                        {stage.dateFormatted}
                      </span>
                    </div>

                    <p className="stage-description">{stage.desc}</p>

                    {/* Rich Details for Current Active Stage */}
                    {isCurrent && stage.id === 'install_scheduled' && (
                      <div className="stage-live-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff7875', fontWeight: 600 }}>
                          <User size={15} />
                          <span>Assigned Field Engineer</span>
                        </div>
                        <div className="stage-live-grid">
                          <div className="stage-live-item">
                            <span className="stage-live-label">Technician</span>
                            <span className="stage-live-val">{bundle.engineer.name}</span>
                          </div>
                          <div className="stage-live-item">
                            <span className="stage-live-label">Role</span>
                            <span className="stage-live-val">{bundle.engineer.role}</span>
                          </div>
                          <div className="stage-live-item">
                            <span className="stage-live-label">Contact</span>
                            <span className="stage-live-val">{bundle.engineer.phone}</span>
                          </div>
                          <div className="stage-live-item">
                            <span className="stage-live-label">Confirmed Slot</span>
                            <span className="stage-live-val" style={{ color: '#22c55e' }}>{selectedSlot}</span>
                          </div>
                          <div className="stage-live-item">
                            <span className="stage-live-label">Security Entry PIN</span>
                            <span className="stage-live-val" style={{ letterSpacing: 2, color: '#ff4d4f' }}>
                              {bundle.engineer.otpCode}
                            </span>
                          </div>
                        </div>

                        <div className="stage-actions-row">
                          <button
                            type="button"
                            className="stage-action-btn"
                            onClick={() => setIsRescheduleOpen(true)}
                          >
                            <Calendar size={13} />
                            Reschedule Slot
                          </button>
                          <button
                            type="button"
                            className="stage-action-btn"
                            onClick={() => triggerToast(`Contacting engineer ${bundle.engineer.name}...`)}
                          >
                            <PhoneCall size={13} />
                            Call Engineer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Bundle Summary & Concierge */}
        <div className="tracker-sidebar">
          {/* Prominent Expected Activation Highlight */}
          <div className="activation-sla-card">
            <div className="sla-label">Promised Activation SLA</div>
            <div className="sla-date-highlight">{formatDate(expectedActivationDate)}</div>
            <p className="sla-sub">
              Guaranteed delivery within <strong>{typicalInstallDays} business days</strong>. Zero service downtime transition.
            </p>
          </div>

          {/* Bundle Summary Card */}
          <div className="bundle-card">
            <div className="bundle-header">
              <h3 className="bundle-title">Ordered Bundle Summary</h3>
              <span style={{ fontSize: '0.78rem', color: '#ff4d4f', fontWeight: 600 }}>
                {bundle.items.length} Products
              </span>
            </div>

            {/* Business Details */}
            <div className="bundle-biz-info">
              <h4 className="bundle-biz-name">{bundle.companyName}</h4>
              <div className="bundle-biz-meta">
                <span>GSTIN: <strong>{bundle.gstin}</strong></span>
                <span>Contact: <strong>{bundle.customerName}</strong> ({bundle.contactPhone})</span>
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 4 }}>
                  <MapPin size={14} color="#ff4d4f" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{bundle.siteAddress}</span>
                </span>
              </div>
            </div>

            {/* Products List */}
            <div className="bundle-item-list">
              {bundle.items.map((prod) => (
                <div key={prod.id} className="bundle-product-row">
                  <div className="bundle-product-left">
                    <div className="bundle-product-icon">
                      {prod.category === 'Connectivity' ? <Zap size={16} /> : <Package size={16} />}
                    </div>
                    <div>
                      <div className="bundle-product-name">{prod.name}</div>
                      <div className="bundle-product-sub">{prod.desc}</div>
                    </div>
                  </div>
                  <div className="bundle-product-price">₹{prod.price.toLocaleString('en-IN')}/mo</div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="bundle-totals">
              <div className="bundle-total-row">
                <span>Monthly Recurring Charges (MRC)</span>
                <span>₹{monthlySubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="bundle-total-row">
                <span>Applicable GST (18%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bundle-total-row">
                <span>One-Time Installation & Hardware Setup</span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>₹0 (WAIVED)</span>
              </div>
              <div className="bundle-total-row grand">
                <span>Total Monthly Investment</span>
                <span>₹{monthlyTotal.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="stage-action-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => triggerToast('Proforma Tax Invoice #UDY-INV-8842 downloaded')}
              >
                <Download size={13} />
                Tax Invoice
              </button>
              <button
                type="button"
                className="stage-action-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => triggerToast('Shareable tracker link copied to clipboard')}
              >
                <Share2 size={13} />
                Share Status
              </button>
            </div>
          </div>

          {/* Assigned Concierge Card */}
          <div className="concierge-card">
            <div className="concierge-avatar">
              {bundle.manager.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="concierge-info">
              <h5>{bundle.manager.name}</h5>
              <p>{bundle.manager.title} • {bundle.manager.circle}</p>
              <span className="concierge-contact">
                Direct Line: {bundle.manager.phone} • {bundle.manager.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Controls: Allows Judges / Reviewers to test each milestone */}
      <div className="tracker-demo-controls">
        <div className="demo-label">
          <Sparkles size={16} color="#ED1C24" />
          <span>Interactive Hackathon Demo: Jump to any stage to inspect responsive animation</span>
        </div>
        <div className="demo-buttons">
          {stages.map((stg, i) => (
            <button
              key={stg.id}
              type="button"
              className={`demo-btn ${activeStageIdx === i ? 'active' : ''}`}
              onClick={() => {
                setActiveStageIdx(i);
                triggerToast(`Switched simulation to: Stage ${i + 1} (${stg.title})`);
              }}
            >
              Stage {i + 1}: {stg.shortName}
            </button>
          ))}
          <button
            type="button"
            className="demo-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => {
              setActiveStageIdx(2);
              triggerToast('Reset simulation to mock state: Installation Scheduled');
            }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Reschedule Visit Modal */}
      {isRescheduleOpen && (
        <div className="tracker-modal-overlay" onClick={() => setIsRescheduleOpen(false)}>
          <div className="tracker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reschedule Engineer Installation</h3>
            <p>
              Select your preferred time slot for optical fibre wiring, ONT router placement, and signal calibration.
            </p>

            <div className="tracker-slot-grid">
              {[
                'Tomorrow, 10:00 AM - 01:00 PM',
                'Tomorrow, 02:00 PM - 05:00 PM',
                'Sat, 18 Jul • 10:00 AM - 01:00 PM',
                'Sat, 18 Jul • 02:00 PM - 05:00 PM',
                'Mon, 20 Jul • 10:00 AM - 01:00 PM',
                'Mon, 20 Jul • 02:00 PM - 05:00 PM'
              ].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`tracker-slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="tracker-modal-actions">
              <button
                type="button"
                className="tracker-modal-cancel"
                onClick={() => setIsRescheduleOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="tracker-modal-confirm"
                onClick={handleConfirmReschedule}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
