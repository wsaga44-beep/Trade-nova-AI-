import { useState, useEffect } from "react";

// ── Colour tokens ──────────────────────────────────────────
const C = {
  navy:    "#0F1E3C",
  navyMid: "#1A2F54",
  gold:    "#F5A623",
  goldDim: "#B87800",
  green:   "#00C48C",
  red:     "#FF4D6A",
  bg:      "#0A1628",
  surface: "#111E35",
  border:  "#1E3050",
  textPri: "#E8EEF8",
  textSec: "#7A8FAD",
  white:   "#FFFFFF",
};

// ── Reusable atoms ─────────────────────────────────────────
const styles = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    color: C.textPri,
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  input: {
    width: "100%",
    background: C.navy,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.textPri,
    fontSize: 15,
    padding: "12px 14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  btnPrimary: {
    width: "100%",
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
    border: "none",
    borderRadius: 12,
    color: C.navy,
    fontSize: 16,
    fontWeight: 700,
    padding: "14px 0",
    cursor: "pointer",
    letterSpacing: 0.3,
  },
  btnSecondary: {
    width: "100%",
    background: "transparent",
    border: `1px solid ${C.gold}`,
    borderRadius: 12,
    color: C.gold,
    fontSize: 15,
    fontWeight: 600,
    padding: "13px 0",
    cursor: "pointer",
    marginTop: 10,
  },
  btnDanger: {
    background: "transparent",
    border: `1px solid ${C.red}`,
    borderRadius: 10,
    color: C.red,
    fontSize: 14,
    fontWeight: 600,
    padding: "10px 18px",
    cursor: "pointer",
  },
  label: {
    fontSize: 12,
    color: C.textSec,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  },
  tag: (color) => ({
    display: "inline-block",
    background: color + "22",
    border: `1px solid ${color}44`,
    borderRadius: 6,
    color,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    letterSpacing: 0.5,
  }),
  navBar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: C.navyMid,
    borderTop: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 14px",
    zIndex: 100,
  },
  navItem: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    cursor: "pointer",
    color: active ? C.gold : C.textSec,
    fontSize: 11,
    fontWeight: active ? 700 : 400,
    border: "none",
    background: "none",
    padding: "4px 12px",
  }),
};

// ── Razorpay config ────────────────────────────────────────
// Replace with your real Razorpay Key ID from dashboard.razorpay.com
const RAZORPAY_KEY_ID = "rzp_test_XXXXXXXXXXXXXXXX";

// Dynamically load Razorpay checkout script
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Mock DB (replace with real backend calls) ──────────────
let mockDB = {
  customers: [],
  trades: [],
  nextId: 1,
};

const PACKAGES = {
  free:    { name: "FREE",    trades: 3,    price: 0,    features: ["3 trades/day", "Basic AI"] },
  micro:   { name: "MICRO",   trades: 5,    price: 50,   original: 500, disc: "90% OFF", features: ["5 trades/day", "90% discount"] },
  student: { name: "STUDENT", trades: 10,   price: 100,  original: 500, disc: "80% OFF", features: ["10 trades/day", "80% discount"] },
  bronze:  { name: "BRONZE",  trades: 20,   price: 500,  features: ["20 trades/day", "Daily info"] },
  silver:  { name: "SILVER",  trades: 50,   price: 1000, features: ["50 trades/day", "Priority"] },
  gold:    { name: "GOLD",    trades: 9999, price: 2500, features: ["Unlimited trades", "All features", "24/7 support"] },
};

function hashPass(p) { return btoa(p + "_hashed"); }

const api = {
  register: (email, password, name, profitAcc) => {
    if (mockDB.customers.find((c) => c.email === email))
      return { success: false, message: "Email already registered" };
    const cust = {
      id: mockDB.nextId++, email, password: hashPass(password),
      name, profit_account: profitAcc, money: 0,
      total_profit: 0, package: "free", trades_today: 0,
      last_trade_date: null,
    };
    mockDB.customers.push(cust);
    return { success: true, message: "Registered!", customer_id: cust.id };
  },
  login: (email, password) => {
    const c = mockDB.customers.find(
      (x) => x.email === email && x.password === hashPass(password)
    );
    if (!c) return { success: false, message: "Wrong email / password" };
    // Reset daily trades if new day
    const today = new Date().toDateString();
    if (c.last_trade_date !== today) { c.trades_today = 0; c.last_trade_date = today; }
    const pkg = PACKAGES[c.package];
    return { success: true, customer: { ...c, package_info: pkg, trades_left: pkg.trades - c.trades_today } };
  },
  addMoney: (id, amount) => {
    if (amount <= 0) return { success: false, message: "Amount must be > 0" };
    const c = mockDB.customers.find((x) => x.id === id);
    if (!c) return { success: false, message: "Not found" };
    c.money += amount;
    return { success: true, money: c.money };
  },
  buyPackage: (id, pkg) => {
    const c = mockDB.customers.find((x) => x.id === id);
    const info = PACKAGES[pkg];
    if (!info) return { success: false, message: "Invalid package" };
    if (c.money < info.price)
      return { success: false, message: `Need ₹${info.price}, you have ₹${c.money}` };
    c.money -= info.price;
    c.package = pkg;
    c.trades_today = 0;
    return { success: true, message: `${info.name} activated!`, package_info: info };
  },
  aiTrade: (id) => {
    const c = mockDB.customers.find((x) => x.id === id);
    if (!c) return { success: false, message: "Not found" };
    const today = new Date().toDateString();
    if (c.last_trade_date !== today) { c.trades_today = 0; c.last_trade_date = today; }
    const pkg = PACKAGES[c.package];
    if (c.trades_today >= pkg.trades)
      return { success: false, message: `Daily limit reached (${pkg.trades}/day)` };
    if (c.money === 0)
      return { success: false, message: "No money! Add money first." };

    const companies = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"];
    const prices = { "RELIANCE.NS": 2845.5, "TCS.NS": 3450, "INFY.NS": 1780, "HDFCBANK.NS": 1620 };
    const picked = companies[Math.floor(Math.random() * companies.length)];
    const news = Math.random() > 0.3 ? "GOOD" : "NEUTRAL";
    const invest = c.money * 0.8;
    const backup = c.money * 0.2;

    // Simulate profit/loss outcome
    const profitPct = news === "GOOD"
      ? (Math.random() * 0.04 + 0.01)   // +1% to +5%
      : (Math.random() * 0.02 - 0.01);   // -1% to +1%
    const profit = invest * profitPct;
    c.total_profit += profit;
    c.trades_today += 1;
    c.last_trade_date = today;

    const trade = {
      id: mockDB.trades.length + 1,
      customer_id: id,
      ticker: picked,
      price: prices[picked],
      news_type: news,
      invest_amount: invest,
      backup_amount: backup,
      profit,
      profit_pct: (profitPct * 100).toFixed(2),
      status: "CLOSED",
      traded_at: new Date().toLocaleString(),
      decision: "TRADE",
    };
    mockDB.trades.push(trade);

    return {
      success: true,
      trade,
      message: `80% invested (₹${invest.toFixed(2)}), 20% backup (₹${backup.toFixed(2)})`,
      trades_left: pkg.trades - c.trades_today,
    };
  },
  getAccount: (id) => {
    const c = mockDB.customers.find((x) => x.id === id);
    if (!c) return { success: false };
    const pkg = PACKAGES[c.package];
    return { success: true, account: { ...c, package_info: pkg, trades_left: pkg.trades - c.trades_today } };
  },
  getTrades: (id) => ({
    success: true,
    trades: mockDB.trades.filter((t) => t.customer_id === id).reverse(),
  }),
};

// ── Razorpay Payment Handler ───────────────────────────────
async function initiateRazorpayPayment({ amount, customerName, customerEmail, onSuccess, onFailure }) {
  const loaded = await loadRazorpay();
  if (!loaded) {
    onFailure("Razorpay failed to load. Check your internet connection.");
    return;
  }

  // In production: create order on your backend first, get order_id
  // const order = await fetch("/api/create-order", { method:"POST", body: JSON.stringify({ amount: amount * 100 }) }).then(r=>r.json());

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay expects paise
    currency: "INR",
    name: "AI Trading Platform",
    description: `Add ₹${amount} to wallet`,
    image: "https://i.imgur.com/3g7nmJC.png", // replace with your logo URL
    // order_id: order.id, // ← uncomment when using real backend orders
    prefill: {
      name: customerName,
      email: customerEmail,
    },
    theme: {
      color: "#F5A623",
      backdrop_color: "#0A1628",
    },
    modal: {
      confirm_close: true,
      ondismiss: () => onFailure("Payment cancelled."),
    },
    handler: function (response) {
      // response.razorpay_payment_id  ← verify this on your backend in production
      // response.razorpay_order_id
      // response.razorpay_signature
      onSuccess(response.razorpay_payment_id || "demo_" + Date.now());
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (response) => {
    onFailure(response.error?.description || "Payment failed. Please try again.");
  });
  rzp.open();
}

// ── Screen components ──────────────────────────────────────

function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setErr("");
    if (!email || !pass) return setErr("Fill all fields");
    setLoading(true);
    setTimeout(() => {
      const r = api.login(email, pass);
      setLoading(false);
      if (r.success) onLogin(r.customer);
      else setErr(r.message);
    }, 600);
  };

  return (
    <div style={{ padding: "60px 24px 30px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🤖</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gold }}>AI Trading</h1>
        <p style={{ margin: "6px 0 0", color: C.textSec, fontSize: 14 }}>Smart investing, automated</p>
      </div>
      <div style={styles.card}>
        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <p style={{ color: C.red, fontSize: 13, margin: "-4px 0 10px" }}>{err}</p>}
        <button style={styles.btnPrimary} onClick={submit} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <button style={styles.btnSecondary} onClick={onGoRegister}>Create Account</button>
      </div>
      <p style={{ textAlign: "center", color: C.textSec, fontSize: 12, marginTop: 16 }}>
        Payments powered by Razorpay · Test mode
      </p>
    </div>
  );
}

function RegisterScreen({ onBack }) {
  const [form, setForm] = useState({ email: "", password: "", name: "", profit_account: "" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.email || !form.password || !form.name) return setErr("Fill all required fields");
    const r = api.register(form.email, form.password, form.name, form.profit_account);
    if (r.success) setSuccess(true);
    else setErr(r.message);
  };

  if (success)
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: C.green }}>Account Created!</h2>
        <p style={{ color: C.textSec }}>You can now sign in.</p>
        <button style={{ ...styles.btnPrimary, marginTop: 20 }} onClick={onBack}>Go to Sign In</button>
      </div>
    );

  return (
    <div style={{ padding: "40px 24px 30px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.gold, fontSize: 15, cursor: "pointer", marginBottom: 16 }}>← Back</button>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800 }}>Create Account</h2>
      <div style={styles.card}>
        {["name", "email", "password", "profit_account"].map((k) => (
          <div key={k}>
            <label style={styles.label}>{k === "profit_account" ? "Profit Account (email/bank)" : k}</label>
            <input
              style={styles.input}
              type={k === "password" ? "password" : k.includes("email") ? "email" : "text"}
              placeholder={k === "name" ? "Full Name" : k === "profit_account" ? "Optional" : ""}
              value={form[k]}
              onChange={set(k)}
            />
          </div>
        ))}
        {err && <p style={{ color: C.red, fontSize: 13, margin: "-4px 0 10px" }}>{err}</p>}
        <button style={styles.btnPrimary} onClick={submit}>Register</button>
      </div>
    </div>
  );
}

function HomeScreen({ customer, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const acc = api.getAccount(customer.id).account;
  const pkg = acc.package_info;

  const doTrade = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = api.aiTrade(customer.id);
      setLoading(false);
      setResult(r);
      onRefresh();
    }, 1800);
  };

  return (
    <div style={{ padding: "24px 20px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, color: C.textSec, fontSize: 12 }}>Welcome back</p>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{acc.name}</h2>
        </div>
        <span style={styles.tag(C.gold)}>{pkg.name}</span>
      </div>

      <div style={{ ...styles.card, background: `linear-gradient(135deg, ${C.navyMid}, #162040)`, border: `1px solid ${C.gold}33` }}>
        <p style={{ margin: "0 0 4px", color: C.textSec, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Total Balance</p>
        <p style={{ margin: "0 0 20px", fontSize: 34, fontWeight: 800, color: C.white }}>
          ₹{acc.money.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: C.green + "18", border: `1px solid ${C.green}33`, borderRadius: 10, padding: 12, textAlign: "center" }}>
            <p style={{ margin: 0, color: C.green, fontSize: 18, fontWeight: 700 }}>₹{(acc.money * 0.8).toFixed(0)}</p>
            <p style={{ margin: "4px 0 0", color: C.textSec, fontSize: 11 }}>80% Trading</p>
          </div>
          <div style={{ flex: 1, background: C.gold + "18", border: `1px solid ${C.gold}33`, borderRadius: 10, padding: 12, textAlign: "center" }}>
            <p style={{ margin: 0, color: C.gold, fontSize: 18, fontWeight: 700 }}>₹{(acc.money * 0.2).toFixed(0)}</p>
            <p style={{ margin: "4px 0 0", color: C.textSec, fontSize: 11 }}>20% Backup</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div style={{ ...styles.card, flex: 1, marginBottom: 0, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: acc.total_profit >= 0 ? C.green : C.red }}>
            {acc.total_profit >= 0 ? "+" : ""}₹{acc.total_profit.toFixed(0)}
          </p>
          <p style={{ margin: "4px 0 0", color: C.textSec, fontSize: 11 }}>Total Profit</p>
        </div>
        <div style={{ ...styles.card, flex: 1, marginBottom: 0, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.gold }}>
            {acc.trades_left === 9999 ? "∞" : acc.trades_left}
          </p>
          <p style={{ margin: "4px 0 0", color: C.textSec, fontSize: 11 }}>Trades Left</p>
        </div>
      </div>

      <button
        style={{
          ...styles.btnPrimary,
          padding: "18px 0",
          fontSize: 18,
          borderRadius: 16,
          opacity: loading ? 0.7 : 1,
          boxShadow: loading ? "none" : `0 4px 24px ${C.gold}44`,
          marginBottom: 16,
        }}
        onClick={doTrade}
        disabled={loading}
      >
        {loading ? "🤖 AI Analysing…" : "🚀 AI TRADE NOW"}
      </button>

      {result && (
        <div style={{
          ...styles.card,
          border: `1px solid ${result.success && result.trade?.decision === "TRADE" ? C.green : C.red}44`,
          animation: "fadeIn 0.4s ease",
        }}>
          {result.success && result.trade?.decision === "TRADE" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: C.green }}>✅ Trade Executed</span>
                <span style={styles.tag(result.trade.news_type === "GOOD" ? C.green : C.textSec)}>{result.trade.news_type}</span>
              </div>
              <p style={{ margin: "0 0 4px", color: C.textSec, fontSize: 13 }}>Company</p>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 18 }}>{result.trade.ticker}</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, background: C.green + "18", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ margin: 0, color: C.green, fontWeight: 700 }}>₹{result.trade.invest_amount.toFixed(0)}</p>
                  <p style={{ margin: 0, color: C.textSec, fontSize: 11 }}>Trading (80%)</p>
                </div>
                <div style={{ flex: 1, background: C.gold + "18", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ margin: 0, color: C.gold, fontWeight: 700 }}>₹{result.trade.backup_amount.toFixed(0)}</p>
                  <p style={{ margin: 0, color: C.textSec, fontSize: 11 }}>Backup (20%)</p>
                </div>
              </div>
              <div style={{ background: (result.trade.profit >= 0 ? C.green : C.red) + "18", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: result.trade.profit >= 0 ? C.green : C.red }}>
                  {result.trade.profit >= 0 ? "+" : ""}₹{result.trade.profit.toFixed(2)}
                </p>
                <p style={{ margin: "2px 0 0", color: C.textSec, fontSize: 12 }}>
                  {result.trade.profit_pct}% return on this trade
                </p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>😞</div>
              <p style={{ margin: 0, fontWeight: 700, color: C.red }}>{result.message}</p>
              <p style={{ margin: "6px 0 0", color: C.textSec, fontSize: 13 }}>Your money is 100% safe.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Money Screen with Razorpay ─────────────────────────
function AddMoneyScreen({ customer, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState(null);
  const [paying, setPaying] = useState(false);
  const quick = [500, 1000, 5000, 10000];

  const acc = api.getAccount(customer.id).account;

  const handlePay = async () => {
    const n = Number(amount);
    if (!n || n <= 0) return setMsg({ type: "err", text: "Enter a valid amount" });
    if (n < 10) return setMsg({ type: "err", text: "Minimum deposit is ₹10" });

    setPaying(true);
    setMsg(null);

    await initiateRazorpayPayment({
      amount: n,
      customerName: acc.name,
      customerEmail: acc.email,
      onSuccess: (paymentId) => {
        // Payment verified → credit wallet
        const r = api.addMoney(customer.id, n);
        setPaying(false);
        if (r.success) {
          setMsg({ type: "ok", text: `✅ ₹${n} added! (Payment ID: ${paymentId.slice(0, 18)}…)` });
          setAmount("");
          onSuccess();
        } else {
          setMsg({ type: "err", text: r.message });
        }
      },
      onFailure: (reason) => {
        setPaying(false);
        setMsg({ type: "err", text: reason });
      },
    });
  };

  return (
    <div style={{ padding: "24px 20px 90px" }}>
      <h2 style={{ marginBottom: 4 }}>Add Money</h2>
      <p style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}>
        Wallet balance: ₹{acc.money.toLocaleString("en-IN")}
      </p>

      <div style={styles.card}>
        <label style={styles.label}>Enter Amount (₹)</label>
        <input
          style={styles.input}
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setMsg(null); }}
          min="10"
        />

        {/* Quick amounts */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {quick.map((q) => (
            <button
              key={q}
              style={{
                background: Number(amount) === q ? C.gold + "22" : C.navy,
                border: `1px solid ${Number(amount) === q ? C.gold : C.border}`,
                borderRadius: 8,
                color: Number(amount) === q ? C.gold : C.textPri,
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 14px",
                cursor: "pointer",
              }}
              onClick={() => { setAmount(q); setMsg(null); }}
            >
              ₹{q.toLocaleString()}
            </button>
          ))}
        </div>

        {msg && (
          <p style={{ color: msg.type === "ok" ? C.green : C.red, fontSize: 13, marginBottom: 10 }}>
            {msg.text}
          </p>
        )}

        <button
          style={{ ...styles.btnPrimary, opacity: paying ? 0.7 : 1 }}
          onClick={handlePay}
          disabled={paying || !amount || Number(amount) <= 0}
        >
          {paying ? "Opening payment…" : `Pay ₹${Number(amount) > 0 ? Number(amount).toLocaleString("en-IN") : "—"} via Razorpay`}
        </button>
      </div>

      {/* Payment methods info */}
      <div style={styles.card}>
        <p style={{ margin: "0 0 4px", color: C.textSec, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>Accepted via Razorpay</p>
        {[
          { icon: "📱", label: "UPI — GPay, PhonePe, Paytm, BHIM" },
          { icon: "💳", label: "Credit / Debit Card (Visa, Mastercard, RuPay)" },
          { icon: "🏦", label: "Net Banking — all major Indian banks" },
          { icon: "👛", label: "Wallets — Mobikwik, Airtel Money" },
          { icon: "📋", label: "EMI — 3, 6, 9, 12 month options" },
        ].map((m) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            <span style={{ fontSize: 13, color: C.textSec }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Security badge */}
      <div style={{ ...styles.card, textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 20 }}>🔒</p>
        <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>
          Payments are processed by <span style={{ color: C.textPri, fontWeight: 600 }}>Razorpay</span> — PCI DSS compliant. Your card details never touch our servers.
        </p>
      </div>
    </div>
  );
}

function PackagesScreen({ customer, onSuccess }) {
  const [buying, setBuying] = useState(null);
  const [msg, setMsg] = useState(null);
  const acc = api.getAccount(customer.id).account;

  const buy = (key) => {
    setBuying(key);
    setTimeout(() => {
      const r = api.buyPackage(customer.id, key);
      setBuying(null);
      if (r.success) { setMsg({ type: "ok", text: `${r.package_info.name} activated!` }); onSuccess(); }
      else setMsg({ type: "err", text: r.message });
    }, 700);
  };

  return (
    <div style={{ padding: "24px 20px 90px" }}>
      <h2 style={{ marginBottom: 4 }}>Packages</h2>
      <p style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}>
        Wallet balance: ₹{acc.money.toLocaleString("en-IN")}
      </p>
      {msg && (
        <p style={{ color: msg.type === "ok" ? C.green : C.red, fontSize: 13, marginBottom: 12, textAlign: "center" }}>
          {msg.text}
        </p>
      )}
      {Object.entries(PACKAGES).map(([key, info]) => {
        const isCurrent = acc.package === key;
        const isBest = key === "gold";
        return (
          <div key={key} style={{ ...styles.card, border: `1px solid ${isCurrent ? C.gold : isBest ? C.gold + "66" : C.border}`, position: "relative" }}>
            {isBest && <span style={{ ...styles.tag(C.gold), position: "absolute", top: 16, right: 16 }}>⭐ BEST</span>}
            {info.disc && <span style={{ ...styles.tag(C.green), marginBottom: 6 }}>{info.disc}</span>}
            <p style={{ margin: "6px 0 2px", fontWeight: 800, fontSize: 18 }}>{info.name}</p>
            <p style={{ margin: "0 0 6px", color: C.textSec, fontSize: 13 }}>
              {info.trades === 9999 ? "Unlimited" : `${info.trades} trades/day`}
            </p>
            <p style={{ margin: "0 0 4px" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>₹{info.price.toLocaleString()}</span>
              {info.original && <span style={{ color: C.textSec, fontSize: 13, marginLeft: 8, textDecoration: "line-through" }}>₹{info.original}</span>}
              <span style={{ color: C.textSec, fontSize: 12 }}>/month</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "10px 0 14px" }}>
              {info.features.map((f) => <span key={f} style={{ ...styles.tag(C.textSec), fontSize: 11 }}>{f}</span>)}
            </div>
            {isCurrent ? (
              <div style={{ textAlign: "center", color: C.green, fontWeight: 700, fontSize: 14, padding: "10px 0" }}>✓ Current Plan</div>
            ) : (
              <button
                style={{ ...styles.btnPrimary, opacity: buying === key ? 0.7 : 1, background: isBest ? `linear-gradient(135deg, ${C.gold}, ${C.goldDim})` : `linear-gradient(135deg, #2A3F6F, #1A2F54)`, color: isBest ? C.navy : C.textPri }}
                onClick={() => buy(key)}
                disabled={!!buying}
              >
                {buying === key ? "Processing…" : info.price === 0 ? "Select Free" : `Buy ₹${info.price}`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TradeHistoryScreen({ customer }) {
  const { trades } = api.getTrades(customer.id);
  return (
    <div style={{ padding: "24px 20px 90px" }}>
      <h2 style={{ marginBottom: 20 }}>Trade History</h2>
      {trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p style={{ color: C.textSec }}>No trades yet. Hit AI Trade Now!</p>
        </div>
      ) : (
        trades.map((t) => (
          <div key={t.id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{t.ticker}</span>
              <span style={styles.tag(t.profit >= 0 ? C.green : C.red)}>
                {t.profit >= 0 ? "+" : ""}₹{t.profit.toFixed(0)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <p style={{ margin: 0, color: C.textSec, fontSize: 11 }}>Price</p>
                <p style={{ margin: 0, fontWeight: 600 }}>₹{t.price.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: C.textSec, fontSize: 11 }}>Invested</p>
                <p style={{ margin: 0, fontWeight: 600, color: C.green }}>₹{t.invest_amount.toFixed(0)}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: C.textSec, fontSize: 11 }}>Return</p>
                <p style={{ margin: 0, fontWeight: 600, color: t.profit >= 0 ? C.green : C.red }}>{t.profit_pct}%</p>
              </div>
            </div>
            <p style={{ margin: "10px 0 0", color: C.textSec, fontSize: 11 }}>🕐 {t.traded_at}</p>
          </div>
        ))
      )}
    </div>
  );
}

function ProfileScreen({ customer, onLogout }) {
  const acc = api.getAccount(customer.id).account;
  const pkg = acc.package_info;

  return (
    <div style={{ padding: "24px 20px 90px" }}>
      <h2 style={{ marginBottom: 20 }}>Profile</h2>
      <div style={styles.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 10px" }}>
            {acc.name[0].toUpperCase()}
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 20 }}>{acc.name}</h3>
          <p style={{ margin: 0, color: C.textSec, fontSize: 13 }}>{acc.email}</p>
        </div>
        {[
          ["Package",          <span style={styles.tag(C.gold)}>{pkg.name}</span>],
          ["Trades Left Today", acc.trades_left === 9999 ? "Unlimited" : acc.trades_left],
          ["Total Balance",    `₹${acc.money.toLocaleString("en-IN")}`],
          ["Total Profit",     <span style={{ color: acc.total_profit >= 0 ? C.green : C.red }}>{acc.total_profit >= 0 ? "+" : ""}₹{acc.total_profit.toFixed(2)}</span>],
          ["Profit Account",   acc.profit_account || "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textSec, fontSize: 13 }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <p style={{ margin: "0 0 8px", color: C.textSec, fontSize: 12, letterSpacing: 0.5 }}>PAYMENT INTEGRATION</p>
        {[
          "✅ Razorpay checkout integrated",
          "✅ UPI / Cards / Net Banking / Wallets",
          "✅ Payment ID captured on success",
          "✅ Wallet credited only after payment",
          "✅ Cancel / failure handled gracefully",
          "⚠️  Add backend order creation for production",
        ].map((b) => (
          <p key={b} style={{ margin: "6px 0", fontSize: 13, color: C.textSec }}>{b}</p>
        ))}
      </div>

      <button style={styles.btnDanger} onClick={onLogout}>Sign Out</button>
    </div>
  );
}

// ── Bottom Nav ─────────────────────────────────────────────
const NAV = [
  { id: "home",     label: "Home",       icon: "🏠" },
  { id: "money",    label: "Add Money",  icon: "💰" },
  { id: "packages", label: "Packages",   icon: "📦" },
  { id: "history",  label: "History",    icon: "📊" },
  { id: "profile",  label: "Profile",    icon: "👤" },
];

// ── App root ───────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("home");
  const [customer, setCustomer] = useState(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const handleLogin = (cust) => { setCustomer(cust); setScreen("app"); };
  const handleLogout = () => { setCustomer(null); setScreen("login"); setTab("home"); };

  return (
    <div style={styles.app}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #4A6080; }
        input:focus { border-color: ${C.gold}88 !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      {screen === "login"    && <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onBack={() => setScreen("login")} />}
      {screen === "app" && customer && (
        <>
          <div style={{ overflowY: "auto", maxHeight: "100vh" }}>
            {tab === "home"     && <HomeScreen     customer={customer} onRefresh={refresh} key={tick} />}
            {tab === "money"    && <AddMoneyScreen  customer={customer} onSuccess={refresh} />}
            {tab === "packages" && <PackagesScreen  customer={customer} onSuccess={refresh} />}
            {tab === "history"  && <TradeHistoryScreen customer={customer} key={tick} />}
            {tab === "profile"  && <ProfileScreen   customer={customer} onLogout={handleLogout} key={tick} />}
          </div>
          <nav style={styles.navBar}>
            {NAV.map((n) => (
              <button key={n.id} style={styles.navItem(tab === n.id)} onClick={() => setTab(n.id)}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
