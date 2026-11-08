import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { advisorEngine } from '../../data/advisorEngine.js';

// Multilingual greeting options
const MULTILINGUAL_GREETINGS = [
  { lang: 'Hindi', text: 'नमस्ते! आपके व्यापार के लिए सही डिजिटल समाधान खोजें' },
  { lang: 'English', text: 'Welcome! Discover the ideal digital solution for your business' },
  { lang: 'Tamil', text: 'வணக்கம்! உங்கள் வணிகத்திற்கான சரியான டிஜிட்டல் தீர்வு' },
  { lang: 'Telugu', text: 'నమస్కారం! మీ వ్యాపారానికి సరైన డిజిటల్ పరిష్కారం' },
  { lang: 'Bengali', text: 'নমস্কার! আপনার ব্যবসার জন্য সঠিক ডিজিটাল সমাধান' },
  { lang: 'Marathi', text: 'नमस्कार! आपल्या व्यवसायासाठी योग्य डिजिटल समाधान' }
];

// Steps definition with conversational prompts and clickable options
const DISCOVERY_STEPS = [
  {
    step: 1,
    key: 'businessType',
    title: 'Business Type',
    question: 'What type of business do you run?',
    options: [
      { label: 'Retail Shop', icon: '🛍️', desc: 'Store, mart, boutique' },
      { label: 'Restaurant/Cafe', icon: '☕', desc: 'Dining, bakery, QSR' },
      { label: 'Clinic/Hospital', icon: '🏥', desc: 'Healthcare, diagnostics' },
      { label: 'Salon/Spa', icon: '💇', desc: 'Beauty & wellness' },
      { label: 'Coaching Centre', icon: '📚', desc: 'Education & training' },
      { label: 'CA/Law Firm', icon: '⚖️', desc: 'Consulting & legal' },
      { label: 'Manufacturing Unit', icon: '🏭', desc: 'Production & workshop' },
      { label: 'Multi-store Chain', icon: '🏬', desc: 'Franchise & retail chain' },
      { label: 'Other', icon: '🏢', desc: 'General MSME business' }
    ]
  },
  {
    step: 2,
    key: 'employeeCount',
    title: 'Team Size',
    question: 'How many employees do you have in your team?',
    options: [
      { label: '1-5', icon: '👥', desc: 'Micro enterprise' },
      { label: '6-15', icon: '👥', desc: 'Small team' },
      { label: '16-50', icon: '👥', desc: 'Growing business' },
      { label: '50+', icon: '👥', desc: 'Mid-to-large business' }
    ]
  },
  {
    step: 3,
    key: 'locations',
    title: 'Locations',
    question: 'How many operational business locations or sites do you manage?',
    options: [
      { label: '1', icon: '📍', desc: 'Single location' },
      { label: '2-5', icon: '📍', desc: '2 to 5 branches' },
      { label: '6-10', icon: '📍', desc: '6 to 10 branches' },
      { label: '10+', icon: '📍', desc: '10+ distributed sites' }
    ]
  },
  {
    step: 4,
    key: 'cityTier',
    title: 'City Tier',
    question: 'Which city tier is your primary business located in?',
    options: [
      { label: 'Tier 1 (Metro)', icon: '🏙️', desc: 'Delhi NCR, Mumbai, Bengaluru, etc.' },
      { label: 'Tier 2', icon: '🌆', desc: 'Indore, Jaipur, Lucknow, Surat, etc.' }
    ]
  },
  {
    step: 5,
    key: 'hasGstin',
    title: 'GSTIN Status',
    question: 'Do you have an active GSTIN registration for tax invoices and ITC claims?',
    options: [
      { label: 'Yes', icon: '✅', desc: 'GST Registered Business' },
      { label: 'No', icon: '❌', desc: 'Unregistered / Composite' }
    ]
  },
  {
    step: 6,
    key: 'currentInternet',
    title: 'Current Setup',
    question: 'What is your current internet connectivity setup?',
    options: [
      { label: 'Mobile hotspot', icon: '📱', desc: 'Using mobile phone/dongle data' },
      { label: 'Home broadband', icon: '🏠', desc: 'Residential connection' },
      { label: 'Business broadband', icon: '🏢', desc: 'Standard business plan' },
      { label: 'Leased line', icon: '⚡', desc: 'Dedicated 1:1 leased link' },
      { label: 'None', icon: '🚫', desc: 'Brand new connectivity setup' }
    ]
  },
  {
    step: 7,
    key: 'budget',
    title: 'Monthly Budget',
    question: 'What is your preferred monthly telecom and digital services budget?',
    options: [
      { label: 'Under ₹1,000', icon: '💰', desc: 'Entry-level essential' },
      { label: '₹1,000-3,000', icon: '💵', desc: 'Standard professional' },
      { label: '₹3,000-10,000', icon: '💳', desc: 'High-speed business growth' },
      { label: '₹10,000+', icon: '💎', desc: 'Enterprise mission-critical' }
    ]
  }
];

function formatCurrency(val) {
  if (val === undefined || val === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

function getTimeString() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AdvisorChat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Conversation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [activeLangIndex, setActiveLangIndex] = useState(0);

  // Initialize chat with welcome greeting and Step 1 question
  useEffect(() => {
    initChat();
  }, []);

  // Ref for the scrollable chat viewport (scroll inside container, not page)
  const chatViewportRef = useRef(null);

  // Smooth scroll to latest message WITHIN the chat viewport only
  useEffect(() => {
    if (chatViewportRef.current) {
      chatViewportRef.current.scrollTo({
        top: chatViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, isAnalyzing, recommendation]);

  // Rotate greeting languages periodically in banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLangIndex(prev => (prev + 1) % MULTILINGUAL_GREETINGS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const initChat = () => {
    setCurrentStepIndex(0);
    setAnswers({});
    setRecommendation(null);
    setIsAnalyzing(false);
    setIsTyping(false);

    const initialMessages = [
      {
        id: 'msg-welcome',
        sender: 'bot',
        isGreeting: true,
        timestamp: getTimeString(),
        hindiGreeting: 'नमस्ते! आपके व्यापार के लिए सही डिजिटल समाधान खोजें',
        text: 'Welcome to Airtel Udyam Digital Advisor! I will help you discover the ideal enterprise-grade broadband, security, cloud tools, and smart solutions custom-tailored for your business scale in under 2 minutes.'
      },
      {
        id: 'msg-step-1',
        sender: 'bot',
        stepNumber: 1,
        stepKey: DISCOVERY_STEPS[0].key,
        question: DISCOVERY_STEPS[0].question,
        options: DISCOVERY_STEPS[0].options,
        timestamp: getTimeString()
      }
    ];

    setMessages(initialMessages);
  };

  const handleSelectOption = (optionLabel) => {
    const currentStep = DISCOVERY_STEPS[currentStepIndex];
    if (!currentStep) return;

    // Record answer
    const updatedAnswers = {
      ...answers,
      [currentStep.key]: optionLabel
    };
    setAnswers(updatedAnswers);

    // Append user response bubble
    const userMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: optionLabel,
      timestamp: getTimeString()
    };

    setMessages(prev => [...prev, userMessage]);

    const nextStepIndex = currentStepIndex + 1;

    // Check if more steps remain
    if (nextStepIndex < DISCOVERY_STEPS.length) {
      setCurrentStepIndex(nextStepIndex);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const nextStep = DISCOVERY_STEPS[nextStepIndex];
        const nextBotMessage = {
          id: `msg-step-${nextStep.step}`,
          sender: 'bot',
          stepNumber: nextStep.step,
          stepKey: nextStep.key,
          question: nextStep.question,
          options: nextStep.options,
          timestamp: getTimeString()
        };
        setMessages(prev => [...prev, nextBotMessage]);
      }, 650);
    } else {
      // All 7 steps collected -> Trigger GenAI Recommendation
      setCurrentStepIndex(DISCOVERY_STEPS.length);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setIsAnalyzing(true);

        // Simulate intelligent AI engine reasoning delay
        setTimeout(() => {
          setIsAnalyzing(false);
          const bundleResult = advisorEngine.recommend(updatedAnswers);

          const rawItems = bundleResult.recommendedProducts || bundleResult.products || [];
          const productIcons = {
            P01: '⚡', P02: '🚀', P03: '⚡', P04: '📶', P05: '🏢',
            P06: '🏭', P07: '📱', P08: '📲', P09: '🔄', P10: '🌐',
            P11: '🔒', P12: '📞', P13: '☎️', P14: '💬', P15: '🟢',
            P16: '📧', P17: '☁️', P18: '🌐', P19: '💳', P20: '🛡️',
            P21: '🔥', P22: '📶', P23: '📹', P24: '⚙️', P25: '🚚'
          };

          const normalizedProducts = rawItems.map(p => ({
            id: p.product_id || p.id,
            name: p.product_name || p.name,
            category: p.category,
            description: p.description,
            unit: p.unit,
            monthlyPrice: Number(p.price_min_inr_per_month ?? p.price_min ?? p.monthlyPrice ?? 0),
            setupCost: Number(p.one_time_setup_inr ?? p.setupCost ?? 0),
            quantity: p.quantity || 1,
            badge: p.badge || p.category,
            icon: productIcons[p.product_id || p.id] || p.icon || '📦'
          }));

          const bundleTitles = {
            'Retail Shop': 'Airtel Smart Commerce Suite',
            'Restaurant/Cafe': 'Airtel DineConnect Hospitality Suite',
            'Clinic/Hospital': 'Airtel MediNet Healthcare Cloud Pack',
            'Salon/Spa': 'Airtel GlamourTech Salon Experience Suite',
            'Coaching Centre': 'Airtel EduConnect Digital Academy Bundle',
            'CA/Law Firm': 'Airtel ProDesk Legal & Finance Cyber Suite',
            'Manufacturing Unit': 'Airtel SmartFactory IoT & Leased Line Suite',
            'Multi-store Chain': 'Airtel Enterprise Multi-Site Mesh',
            'Other': 'Airtel Udyam Digital Growth Bundle'
          };

          const finalMonthly = Number(bundleResult.monthlyTotal ?? bundleResult.monthly_total ?? 0);
          const finalSetup = Number(bundleResult.setupTotal ?? bundleResult.setup_total ?? 0);
          const rawMonthly = normalizedProducts.reduce((sum, item) => sum + item.monthlyPrice * item.quantity, 0);
          const rawSetup = normalizedProducts.reduce((sum, item) => sum + item.setupCost * item.quantity, 0);
          const savings = Math.max(0, Math.round((rawMonthly * 12 + rawSetup) - (finalMonthly * 12 + finalSetup))) || Math.round(finalMonthly * 0.15 * 12);

          const finalBundle = {
            ...bundleResult,
            bundleName: bundleTitles[updatedAnswers.businessType] || bundleResult.bundleName || `${bundleResult.segmentName || 'Enterprise'} Bundle`,
            tagline: bundleResult.tagline || 'All-in-one business connectivity, digital operations & security suite',
            category: bundleResult.segmentName || bundleResult.category || 'Enterprise Digital Suite',
            matchScore: bundleResult.matchScore || 98,
            rationale: bundleResult.reasoning || bundleResult.rationale,
            products: normalizedProducts,
            monthlyTotal: finalMonthly,
            setupTotal: finalSetup,
            rawMonthly,
            rawSetup,
            annualSavings: savings,
            typicalInstallDays: bundleResult.typicalInstallDays || 3,
            answers: updatedAnswers
          };

          setRecommendation(finalBundle);

          const resultMessage = {
            id: `msg-result-${Date.now()}`,
            sender: 'bot',
            isRecommendation: true,
            recommendationData: finalBundle,
            timestamp: getTimeString()
          };

          setMessages(prev => [...prev, resultMessage]);
        }, 1300);
      }, 700);
    }
  };

  const handleProceedToQuote = (bundleData) => {
    const finalBundle = bundleData || recommendation;
    try {
      localStorage.setItem('udyam_recommendation', JSON.stringify(finalBundle));
      localStorage.setItem('udyam_answers', JSON.stringify(answers));
      sessionStorage.setItem('udyam_recommendation', JSON.stringify(finalBundle));
    } catch (e) {
      console.warn('Storage sync:', e);
    }

    if (navigate) {
      navigate('/quote', { state: { recommendation: finalBundle, answers } });
    } else {
      window.location.href = '/quote';
    }
  };

  const progressPercentage = Math.min(Math.round((currentStepIndex / DISCOVERY_STEPS.length) * 100), 100);

  return (
    <div className="advisor-container">
      <div className="advisor-chat-card">
        {/* Top Header Bar */}
        <div className="advisor-top-bar">
          <div className="advisor-bot-info">
            <div className="advisor-bot-avatar">
              🤖
            </div>
            <div className="advisor-bot-details">
              <div className="advisor-bot-title">
                Airtel Udyam AI Advisor
                <span className="badge-red" style={{ fontSize: '10px', padding: '1px 6px' }}>v4.2</span>
              </div>
              <div className="advisor-bot-status">
                <span className="advisor-bot-status-dot"></span>
                <span>Active • GenAI Business Profiler</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="advisor-progress-wrap">
              <span className="advisor-progress-label">
                {currentStepIndex < DISCOVERY_STEPS.length
                  ? `Step ${currentStepIndex + 1} of ${DISCOVERY_STEPS.length}`
                  : 'Profile Complete'}
              </span>
              <div className="advisor-progress-track">
                <div
                  className="advisor-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <button
              type="button"
              className="advisor-restart-btn"
              onClick={initChat}
              title="Reset discovery and start again"
            >
              <span>↺</span> Restart
            </button>
          </div>
        </div>

        {/* Multilingual Switcher Strip */}
        <div className="advisor-multilingual-strip">
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>🌐 Available in:</span>
          {MULTILINGUAL_GREETINGS.map((item, idx) => (
            <span
              key={item.lang}
              className={`advisor-lang-pill ${idx === activeLangIndex ? 'active' : ''}`}
            >
              {item.lang}
            </span>
          ))}
        </div>

        {/* Chat Scrollable Viewport */}
        <div className="chat-viewport" ref={chatViewportRef}>
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`message-item ${isBot ? 'message-bot' : 'message-user'}`}
              >
                {/* Avatar Icon */}
                <div className={`chat-avatar ${isBot ? 'chat-avatar-bot' : 'chat-avatar-user'}`}>
                  {isBot ? '🤖' : '👤'}
                </div>

                {/* Message Body Content */}
                <div className="message-content">
                  <div className={`message-bubble ${isBot ? 'message-bubble-bot' : 'message-bubble-user'}`}>
                    {/* Welcome Greeting Block with Multilingual Display */}
                    {msg.isGreeting && (
                      <div className="message-greeting-box">
                        <div className="message-greeting-hindi">
                          {msg.hindiGreeting}
                        </div>
                        <div className="message-greeting-english">
                          {MULTILINGUAL_GREETINGS[activeLangIndex].text}
                        </div>
                      </div>
                    )}

                    {/* Standard Text or Question */}
                    {msg.text && (
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    )}

                    {msg.question && (
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {msg.question}
                      </div>
                    )}

                    {/* Recommendation Card Display */}
                    {msg.isRecommendation && msg.recommendationData && (
                      <div>
                        <div style={{ marginBottom: '12px', color: '#FFFFFF', fontWeight: 600 }}>
                          ✨ Based on your profile, here is your curated Airtel Business Digital Bundle:
                        </div>
                        <RecommendationCard
                          data={msg.recommendationData}
                          onProceed={handleProceedToQuote}
                          onRestart={initChat}
                        />
                      </div>
                    )}
                  </div>

                  <span className="message-time">{msg.timestamp}</span>

                  {/* Render Clickable Options only on the active question message */}
                  {isBot && msg.options && isLastMessage && !recommendation && !isAnalyzing && (
                    <div className="option-container">
                      <div className="option-prompt">
                        <span>Select one option to continue:</span>
                      </div>
                      <div className={msg.options.length <= 4 ? 'option-grid-compact' : 'option-grid'}>
                        {msg.options.map(opt => (
                          <button
                            key={opt.label}
                            type="button"
                            className={`option-btn ${msg.options.length <= 4 ? 'option-btn-pill' : ''}`}
                            onClick={() => handleSelectOption(opt.label)}
                          >
                            {opt.icon && <span className="option-btn-icon">{opt.icon}</span>}
                            <div className="option-btn-text">
                              <div>{opt.label}</div>
                              {opt.desc && (
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                                  {opt.desc}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message-item message-bot">
              <div className="chat-avatar chat-avatar-bot">🤖</div>
              <div className="message-content">
                <div className="chat-typing">
                  <div className="chat-typing-dot"></div>
                  <div className="chat-typing-dot"></div>
                  <div className="chat-typing-dot"></div>
                </div>
                <span className="message-time">Typing...</span>
              </div>
            </div>
          )}

          {/* AI Analyzing State */}
          {isAnalyzing && (
            <div className="message-item message-bot">
              <div className="chat-avatar chat-avatar-bot">🤖</div>
              <div className="message-content" style={{ width: '100%', maxWidth: '520px' }}>
                <div className="message-analyzing-wrap">
                  <div className="message-analyzing-spinner"></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      ⚡ AI Engine Matching Products & Eligibility...
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Evaluating 25+ Airtel Business enterprise plans, GSTIN rules & bundle discounts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Footer Bar */}
        <div className="chat-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔒 Bank-Grade Privacy</span>
            <span>•</span>
            <span>⚡ Instant AI Quote Engine</span>
          </div>
          <div>
            Airtel SYNC Hackathon 2026 • Project Udyam Digital
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendation Card Component with Animated Gradient Border
 */
function RecommendationCard({ data, onProceed, onRestart }) {
  if (!data) return null;

  const {
    bundleName,
    tagline,
    category,
    matchScore,
    rationale,
    products = [],
    monthlyTotal,
    setupTotal,
    rawMonthly,
    annualSavings,
    typicalInstallDays
  } = data;

  return (
    <div className="advisor-recommendation-card">
      <div className="advisor-recommendation-inner">
        {/* Card Header Top */}
        <div className="advisor-card-top">
          <div className="advisor-card-title-group">
            <div className="advisor-card-badge">
              <span>★</span> Recommended Bundle • {category}
            </div>
            <h3 className="advisor-card-title">{bundleName}</h3>
            <p className="advisor-card-tagline">{tagline}</p>
          </div>

          <div className="advisor-match-pill">
            <span style={{ fontSize: '13px' }}>⚡</span>
            <span>{matchScore}% Match</span>
          </div>
        </div>

        {/* GenAI Rationale Box */}
        <div className="advisor-rationale-box">
          <div className="advisor-rationale-header">
            <span>💡</span> GenAI Advisor Rationale
          </div>
          <div className="advisor-rationale-text">
            "{rationale}"
          </div>
        </div>

        {/* Products List Section */}
        <div className="advisor-products-section">
          <div className="advisor-section-title">
            <span>Included Enterprise Products ({products.length})</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>
              ✓ SLA Backed
            </span>
          </div>

          <div className="advisor-products-list">
            {products.map(item => (
              <div key={item.id} className="advisor-product-row">
                <div className="advisor-product-main">
                  <div className="advisor-product-icon">
                    {item.icon || '📦'}
                  </div>
                  <div className="advisor-product-meta">
                    <div className="advisor-product-name-row">
                      <span className="advisor-product-name">{item.name}</span>
                      {item.badge && (
                        <span className="advisor-product-badge">{item.badge}</span>
                      )}
                    </div>
                    <span className="advisor-product-desc">{item.description}</span>
                  </div>
                </div>

                <div className="advisor-product-pricing">
                  <span className="advisor-product-price">
                    {formatCurrency(item.monthlyPrice)}
                  </span>
                  <span className="advisor-product-unit">
                    / mo • {item.unit} {item.quantity > 1 ? `(Qty: ${item.quantity})` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary Grid */}
        <div className="advisor-pricing-grid">
          <div className="advisor-pricing-cell">
            <span className="advisor-pricing-label">Monthly Bundle</span>
            <span className="advisor-pricing-val accent">
              {formatCurrency(monthlyTotal)}
            </span>
            <span className="advisor-pricing-sub">
              {rawMonthly > monthlyTotal ? `Was ${formatCurrency(rawMonthly)}/mo` : 'Inclusive of 12% bundle discount'}
            </span>
          </div>

          <div className="advisor-pricing-cell highlight">
            <span className="advisor-pricing-label">One-time Setup</span>
            <span className={`advisor-pricing-val ${setupTotal === 0 ? 'free' : ''}`}>
              {setupTotal === 0 ? 'FREE (₹0)' : formatCurrency(setupTotal)}
            </span>
            <span className="advisor-pricing-sub">
              {setupTotal === 0 ? '100% waiver applied' : '50% promotional waiver'}
            </span>
          </div>

          <div className="advisor-pricing-cell">
            <span className="advisor-pricing-label">Est. Activation</span>
            <span className="advisor-pricing-val">
              {typicalInstallDays || 3} Days
            </span>
            <span className="advisor-pricing-sub">
              Fast-track field deployment
            </span>
          </div>
        </div>

        {/* Savings Highlight Banner */}
        {annualSavings > 0 && (
          <div className="advisor-savings-banner">
            <span>🎉 MSME Udyam Digital Hackathon Advantage</span>
            <span style={{ fontWeight: 700 }}>Save {formatCurrency(annualSavings)} / year</span>
          </div>
        )}

        {/* Actions Row */}
        <div className="advisor-actions">
          <button
            type="button"
            className="advisor-cta-btn"
            onClick={() => onProceed(data)}
          >
            <span>Proceed to Quote</span>
            <span style={{ fontSize: '1.2rem' }}>➔</span>
          </button>

          <button
            type="button"
            className="advisor-cta-btn-secondary"
            onClick={onRestart}
          >
            <span>Modify Answers</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvisorChat;
