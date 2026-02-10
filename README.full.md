# 🦅 IntelliFin: Institutional-Grade Valuation Intelligence

**IntelliFin** is a professional, end-to-end fundamental modelling and valuation platform designed for large-cap Indian financial institutions, with a focus on **Bajaj Finance Ltd**. 

It transitions complex historical financial reports into actionable intrinsic value insights using a transparent, academic-grade DCF (Discounted Cash Flow) engine.

---

## ✨ Primary Capabilities

- **📊 Professional Visual Layer**: Multi-section financial visualizations using Recharts, strictly differentiating audited history from professional projections.
- **🧬 Transparent DCF Engine**: A ground-up financial model featuring 5-year forecasts, WACC-based discounting, and Intrinsic Value signals.
- **🔐 Secure Access Vault**: A "True Black" themed, JWT-secured authentication system using real bcrypt hashing.
- **🤖 Intelligence Bot**: An AI interpretive layer that explains complex valuation metrics (WACC, Terminal Value, FCF) in plain English.
- **📈 Scenario Sensitivity**: Interactive "What-If" analysis allowing users to stress-test valuation drivers in real-time.

---

## 🛠️ Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, Tailwind CSS, Lucide Icons |
| **Data Viz** | Recharts (Academic Standard) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Managed via Render/Local) |
| **Security** | JWT (JSON Web Tokens) & Bcrypt Hashing |
| **Logic** | Custom Financial Modelling Engine |

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** instance
- **GitHub Account** (to use the provided history)

### 2. Database Initialization
Ensure a PostgreSQL database named `bajaj_finance_db` is created. The schema is located in `database/migrations/`.

### 3. Backend Deployment
```bash
cd backend
npm install
# Create a .env file with your DATABASE_URL and JWT_SECRET
npm start
```

### 4. Frontend Deployment
```bash
cd frontend
npm install
npm run build
npm start
```

---

## 🎯 Institutional Demo Walkthrough

### Stage 1: The Identity Vault
Visit the **Login** page. Experience the "True Black" premium aesthetic. Create a secure identity via **Signup** to enter the Intelligence Platform.

### Stage 2: Dashboard Overview (Market vs Intrinsic)
Upon entry, the system immediately compares the **Current Market Price** (₹7200) against our **Intrinsic Value Model** (₹6378). A clear recommendation (HOLD/BUY/SELL) is generated based on the professional margin of safety.

### Stage 3: The Financial Continuum
Navigate to the **Forecast** tab. Observe the seamless transition from **Audited History** (Solid lines) to **Professional Projections** (Dashed lines). This visual integrity satisfies institutional trust standards.

### Stage 4: Valuation Bridge
Examine the **Valuation breakdown**. The platform provides a visual "bridge" from Enterprise Value to Net Debt and ultimately to Equity Value per share.

### Stage 5: AI Explanation
Open the **Intelligence Bot**. Ask: *"Explain why the WACC is set at 12.5%?"*. The bot will provide a data-driven explanation directly from the model assumptions.

---

## 🏛️ Project Principles
1. **Trust Over Trading**: Zero technical indicators (RSI/MACD). Focus is purely on fundamental value.
2. **Visual Integrity**: Dashed lines for future, Solid for past.
3. **No Frontend Math**: 100% of financial calculations are performed on the secure server.
4. **Institutional Aesthetic**: Professional, neutral, and high-contrast #050505 "True Black" design.

---

### 📝 Handover Info
- **Developer**: Team Buglife
- **Repository**: [coderved63/ACCATHON_3.0_PROTOTYPE](https://github.com/coderved63/ACCATHON_3.0_PROTOTYPE)
- **Deployment**: [Vercel Deployment Roadmap](./VERCEL_DEPLOYMENT.md)
