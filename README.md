# 🚀 Project Udyam Digital — Airtel SYNC Hackathon 2026

> **Making small businesses go digital in one sitting.**

A digital-first MSME acquisition and onboarding platform that lets small business owners discover the right bundle, buy it, and get activated — all from their phone.

---

## 📋 Submission Deliverables

| # | Deliverable | Location | Format |
|---|---|---|---|
| 1 | **Working Prototype** | This repo — `npm run dev` | React SPA |
| 2 | **Solution Architecture** | [`/docs/architecture.html`](public/docs/architecture.html) | Standalone HTML |
| 3 | **Business Case (10 slides)** | [`/docs/business_case.html`](public/docs/business_case.html) | Standalone HTML |
| 4 | **Privacy & Security Note** | In-app at `/privacy` route | React page |

---

## 🖥️ Demo Run Instructions

### Prerequisites
- **Node.js** v20+ installed
- **npm** (comes with Node.js)

### Quick Start (3 commands)

```bash
# 1. Navigate to the project
cd hackathon_project

# 2. Install dependencies
npm install

# 3. Start the dev server
npx vite --host
```

The app will open at **http://localhost:5173**

### For Video Recording Demo Flow

Follow this sequence to demonstrate the complete journey:

#### Step 1: Landing Page (`/`)
- Show the hero section with "Go digital in one sitting" tagline
- Point out the animated stats counters (25 products, 5000+ SMBs, <7 days, 95% satisfaction)
- Show the 4 feature cards and the funnel analytics section
- Click **"Start with AI Advisor"**

#### Step 2: AI Advisor (`/advisor`)
- The AI advisor greets in multiple Indian languages
- Walk through the 7-step conversational flow:
  1. Select **"Retail Shop"** (or "Clinic/Hospital" for professional demo)
  2. Select **"6-15"** employees
  3. Select **"1"** location
  4. Select **"Tier 2"** city
  5. Select **"Yes"** for GSTIN
  6. Select **"Mobile hotspot"** for current internet
  7. Select **"₹1,000-3,000"** budget
- Watch the AI generate a personalized bundle recommendation
- Click **"Proceed to Quote"**

#### Step 3: Quote Builder (`/quote`)
- Show the recommended products pre-selected with real-time pricing
- Toggle products on/off — show price updates instantly
- Adjust quantities for per-site/per-line products
- Show dependency warnings (e.g., SD-WAN needs broadband)
- Show eligibility filtering (greyed-out products with reasons)
- Point out the sticky summary panel with monthly total, setup cost
- Click **"Proceed to KYC"**

#### Step 4: Smart KYC (`/kyc`)
- **Step 1 - Consent**: Show DPDP Act 2023 consent notice, check the box
- **Step 2 - GSTIN**: Enter `32TTNXB7384T1ZW` (pre-filled sample)
  - Show real-time format validation
  - Click Verify → business details auto-populated from mock registry
  - Show masked GSTIN display (32***********1ZW)
  - Point out Active/Suspended/Cancelled status checking
- **Step 3 - Udyam**: Enter `UDYAM-KL-00-3078801` (pre-filled)
  - Verify → shows enterprise details, Micro classification
  - Cross-check with GSTIN trade name
- **Step 4 - Documents**: Upload any image files as specimens
  - Show simulated OCR extraction after 1.5s delay
  - Show validation status indicators (✅ ⚠️ ❌)
- **Step 5 - Summary**: All verified info displayed with green checkmarks
- Click **"Submit & Proceed"**

#### Step 5: Order Tracker (`/tracker`)
- Show the vertical timeline with 6 activation stages
- Current stage highlighted with pulse animation
- Expected activation date prominently displayed
- Point out "No need to call" reassurance message
- Show the interactive stage selector (judge demo controls)

#### Step 6: Submission Documents
- Open **Architecture Diagram**: `http://localhost:5173/docs/architecture.html`
  - 5-layer architecture, 3 data flow diagrams, tech stack
- Open **Business Case**: `http://localhost:5173/docs/business_case.html`
  - Navigate through 10 slides with arrow keys or buttons
  - Show funnel visualization, pricing strategy, success metrics
- Navigate to **Privacy Note**: `http://localhost:5173/privacy`
  - DPDP Act 2023 compliance details, data masking examples

### Sample Data for Demo

| Data | Sample Value | Notes |
|---|---|---|
| GSTIN | `32TTNXB7384T1ZW` | Balaji Dental Care LLP, Kerala, Active |
| GSTIN (Suspended) | `23QYBXS1811Q1ZD` | Sahyadri Realty, Bhopal, Suspended |
| Udyam | `UDYAM-KL-00-3078801` | Micro enterprise, Services |
| Invalid GSTIN | `XXXXXXXXXXXX` | Will show validation errors |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│              FRONTEND (React SPA)            │
│  ┌─────────┐ ┌───────┐ ┌─────┐ ┌─────────┐ │
│  │ Advisor  │ │ Quote │ │ KYC │ │ Tracker │ │
│  └─────────┘ └───────┘ └─────┘ └─────────┘ │
├─────────────────────────────────────────────┤
│           LOGIC LAYER (JavaScript)           │
│  ┌──────────────┐ ┌────────────────────┐    │
│  │ Advisor       │ │ Product Eligibility│    │
│  │ Engine        │ │ Engine             │    │
│  ├──────────────┤ ├────────────────────┤    │
│  │ GSTIN        │ │ Bundle             │    │
│  │ Validator    │ │ Calculator         │    │
│  └──────────────┘ └────────────────────┘    │
├─────────────────────────────────────────────┤
│            DATA LAYER (JSON APIs)            │
│  25 Products │ 3,534 GSTIN │ 2,723 Udyam   │
│  5,000 Lead Analytics │ 47 KYC Specimens    │
├─────────────────────────────────────────────┤
│       SECURITY & COMPLIANCE (DPDP 2023)      │
│  Consent │ Masking │ Purpose Limitation      │
└─────────────────────────────────────────────┘
```

---

## 📊 Key Metrics (from Case Study Data)

| Metric | Current (Baseline) | Target (With Udyam Digital) |
|---|---|---|
| Lead-to-activation | 7.4% | 20%+ |
| Time to activation | 17.6 days | < 7 days |
| Customer chase calls | 3 per customer | 0 (self-service) |
| Acquisition cost | ₹15,000 | < ₹5,000 |
| Quote-stage drop-off | 56% | < 20% |

---

## 🗂️ Data Sources (All Synthetic)

| File | Records | Purpose |
|---|---|---|
| `product_catalogue.csv` | 25 products | Advisor recommendations & quotes |
| `smb_leads.csv` | 5,000 leads | Funnel analytics & segment insights |
| `mock_gstin_registry.csv` | 3,534 | GSTIN lookup API backing data |
| `mock_udyam_registry.csv` | 2,723 | Udyam lookup API backing data |
| `kyc_documents/` | 47 images | Specimen documents for OCR demo |

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + React Router v7
- **Styling**: Vanilla CSS with custom glassmorphism design system (2,400+ lines)
- **Icons**: Lucide React
- **Data**: JSON mock APIs converted from CSV datasets
- **Validation**: Custom GSTIN checksum + Udyam format validators
- **Privacy**: DPDP Act 2023 compliant consent & data masking

---

*Built for Airtel SYNC Hackathon 2026 — Enterprise Track A: Project Udyam Digital*
