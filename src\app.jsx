import { useState } from "react";

// ── Metal/Black colour tokens ──────────────────────────────
const C = {
  black:    "#000000",
  black2:   "#0A0A0A",
  black3:   "#111111",
  black4:   "#1A1A1A",
  black5:   "#222222",
  border:   "#2A2A2A",
  borderHi: "#3A3A3A",
  metal:    "#C0C0C0",
  metalHi:  "#E8E8E8",
  metalDim: "#888888",
  metalDark:"#444444",
  chrome1:  "#F0F0F0",
  chrome2:  "#A0A0A0",
  chrome3:  "#D0D0D0",
  accent:   "#00BFFF",
  accentDim:"#007BA8",
  green:    "#00E676",
  red:      "#FF1744",
  textPri:  "#F0F0F0",
  textSec:  "#888888",
};

const metalGrad = {
  background: "linear-gradient(180deg, #F0F0F0 0%, #A0A0A0 50%, #D0D0D0 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const S = {
  app: {
    minHeight: "100vh",
    background: "#000",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#F0F0F0",
    maxWidth: 480,
    margin: "0 auto",
  },
  card: {
    background: "#111",
    border: "1px solid #2A2A2A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  cardMetal: {
    background: "linear-gradient(145deg, #1A1A1A, #111111)",
    border: "1px solid #3A3A3A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    boxShadow: "inset 0 1px 0 #55555533, 0 4px 20px #00000088",
  },
  input: {
    width: "100%",
    background: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: 10,
    color: "#F0F0F0",
    fontSize: 15,
    padding: "12px 14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  btnPrimary: {
    width: "100%",
    background: "linear-gradient(180deg, #E8E8E8 0%, #C0C0C0 40%, #A0A0A0 100%)",
    border: "1px solid #888",
    borderRadius: 12,
    color: "#000",
    fontSize: 16,
    fontWeight: 800,
    padding: "14px 0",
    cursor: "pointer",
    letterSpacing: 0.5,
    boxShadow: "0 2px 8px #00000066, inset 0 1px 0 #F0F0F0",
  },
  btnAccent: {
    width: "100%",
    background: "linear-gradient(135deg, #00BFFF, #007BA8)",
    border: "none",
    borderRadius: 12,
    color: "#000",
    fontSize: 16,
    fontWeight: 800,
    padding: "14px 0",
    cursor: "pointer",
  },
  btnOutline: {
    width: "100%",
    background: "transparent",
    border: "1px solid #2A2A2A",
    borderRadius: 12,
    color: "#C0C0C0",
    fontSize: 15,
    fontWeight: 600,
    padding: "13px 0",
    cursor: "pointer",
    marginTop: 10,
  },
  label: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  },
  tag: (color) => ({
    display: "inline-block",
    background: color + "18",
    border: `1px solid ${color}44`,
    borderRadius: 5,
    color,
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  }),
  navBar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "#111",
    borderTop: "1px solid #2A2A2A",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 14px",
    zIndex: 100,
    boxShadow: "0 -4px 20px #00000088",
  },
  navItem: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    cursor: "pointer",
    color: active ? "#00BFFF" : "#444",
    fontSize: 10,
    fontWeight: active ? 700 : 400,
    letterSpacing: 0.5,
    border: "none",
    background: "none",
    padding: "4px 12px",
    textTransform: "uppercase",
  }),
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, #2A2A2A, transparent)",
    margin: "12px 0",
  },
};

// ── Razorpay ───────────────────────────────────────────────
const RAZORPAY_KEY_ID = "rzp_test_XXXXXXXXXXXXXXXX";

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

// ── Mock DB ────────────────────────────────────────────────
let mockDB = { customers: [], trades: [], nextId: 1 };

const PACKAGES = {
  free:    { name: "FREE",    trades: 3,    price: 0,    features: ["3 trades/day", "Basic AI"] },
  micro:   { name: "MICRO",   trades: 5,    price: 50,   original: 500, disc: "90% OFF", features: ["5 trades/day"] },
  student: { name: "STUDENT", trades: 10,   price: 100,  original: 500, disc: "80% OFF", features: ["10 trades/day"] },
  bronze:  { name: "BRONZE",  trades: 20,   price: 500,  features: ["20 trades/day"] },
  silver:  { name: "SILVER",  trades: 50,   price: 1000, features: ["50 trades/day", "Priority"] },
  gold:    { name: "GOLD",    trades: 9999, price: 2500, features: ["Unlimited", "All features", "24/7 support"] },
};

function hashPass(p) { return btoa(p + "_hashed"); }

const api = {
  register: (email, password, name, profitAcc) => {
    if (mockDB.customers.find((c) => c.email === email))
      return { success: false, message: "Email already registered" };
    const cust = { id: mockDB.nextId++, email, password: hashPass(password), name, profit_account: profitAcc, money: 0, total_profit: 0, package: "free", trades_today: 0, last_trade_date: null };
    mockDB.customers.push(cust);
    return { success: true };
  },
  login: (email, password) => {
    const c = mockDB.customers.find((x) => x.email === email && x.password === hashPass(password));
    if (!c) return { success: false, message: "Wrong email or password" };
    const today = new Date().toDateString();
    if (c.last_trade_date !== today) { c.trades_today = 0; c.last_trade_date = today; }
    const pkg = PACKAGES[c.package];
    return { success: true, customer: { ...c, package_info: pkg, trades_left: pkg.trades - c.trades_today } };
  },
  addMoney: (id, amount) => {
    const c = mockDB.customers.find((x) => x.id === id);
    if (!c) return { success: false, message: "Not found" };
    c.money += amount;
    return { success: true, money: c.money };
  },
  buyPackage: (id, pkg) => {
    const c = mockDB.customers.find((x) => x.id === id);
    const info = PACKAGES[pkg];
    if (!info) return { success: false, message: "Invalid package" };
    if (c.money < info.price) return { success: false, message: `Need ₹${info.price}, you have ₹${c.money}` };
    c.money -= info.price; c.package = pkg; c.trades_today = 0;
    return { success: true, message: `${info.name} activated!`, package_info: info };
  },
  aiTrade: (id) => {
    const c = mockDB.customers.find((x) => x.id === id);
    if (!c) return { success: false, message: "Not found" };
    const today = new Date().toDateString();
    if (c.last_trade_date !== today) { c.trades_today = 0; c.last_trade_date = today; }
    const pkg = PACKAGES[c.package];
    if (c.trades_today >= pkg.trades) return { success: false, message: `Daily limit reached (${pkg.trades}/day)` };
    if (c.money === 0) return { success: false, message: "Add money first" };
    const companies = ["RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS"];
    const prices = { "RELIANCE.NS": 2845.5, "TCS.NS": 3450, "INFY.NS": 1780, "HDFCBANK.NS": 1620 };
    const picked = companies[Math.floor(Math.random() * companies.length)];
    const news = Math.random() > 0.3 ? "GOOD" : "NEUTRAL";
    const invest = c.money * 0.8;
    const backup = c.money * 0.2;
    const profitPct = news === "GOOD" ? (Math.random() * 0.04 + 0.01) : (Math.random() * 0.02 - 0.01);
    const profit = invest * profitPct;
    c.total_profit += profit; c.trades_today += 1; c.last_trade_date = today;
    const trade = { id: mockDB.trades.length + 1, customer_id: id, ticker: picked, price: prices[picked], news_type: news, invest_amount: invest, backup_amount: backup, profit, profit_pct: (profitPct * 100).toFixed(2), traded_at: new Date().toLocaleString() };
    mockDB.trades.push(trade);
    return { success: true, trade, trades_left: pkg.trades - c.trades_today };
  },
  getAccount: (id) => {
    const c = mockDB.customers.find((x) => x.id === id);
    if (!c) return { success: false };
    const pkg = PACKAGES[c.package];
    return { success: true, account: { ...c, package_info: pkg, trades_left: pkg.trades - c.trades_today } };
  },
  getTrades: (id) => ({ success: true, trades: mockDB.trades.filter((t) => t.customer_id === id).reverse() }),
};

async function initiateRazorpayPayment({ amount, customerName, customerEmail, onSuccess, onFailure }) {
  const loaded = await loadRazorpay();
  if (!loaded) return onFailure("Razorpay failed to load.");
  const options = {
    key: RAZORPAY_KEY_ID, amount: amount * 100, currency: "INR",
    name: "TradeNova", description: `Add ₹${amount} to wallet`,
    prefill: { name: customerName, email: customerEmail },
    theme: { color: "#00BFFF", backdrop_color: "#000000" },
    modal: { confirm_close: true, ondismiss: () => onFailure("Payment cancelled.") },
    handler: (response) => onSuccess(response.razorpay_payment_id || "demo_" + Date.now()),
  };
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (r) => onFailure(r.error?.description || "Payment failed."));
  rzp.open();
}

// ── Metal Logo ─────────────────────────────────────────────
function LogoMark({ size = 48 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: "linear-gradient(145deg, #222, #111)",
      border: "1px solid #3A3A3A",
      boxShadow: "inset 0 1px 0 #55555555, 0 4px 16px #00000099",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg, #ffffff08, transparent)", borderRadius: `${size*0.28}px ${size*0.28}px 0 0` }} />
      <span style={{ fontSize: size * 0.40, fontWeight: 900, ...metalGrad, position: "relative", zIndex: 1, letterSpacing: -1 }}>TN</span>
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────
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
      if (r.success) onLogin(r.customer); else setErr(r.message);
    }, 600);
  };

  return (
    <div style={{ padding: "60px 24px 30px", minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #00BFFF08 0%, transparent 60%), #000" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <LogoMark size={72} />
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1, ...metalGrad }}>TradeNova</h1>
        <p style={{ margin: "8px 0 0", color: "#888", fontSize: 12, letterSpacing: 2.5, textTransform: "uppercase" }}>AI-Powered Trading</p>
      </div>
      <div style={S.cardMetal}>
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <p style={{ color: "#FF1744", fontSize: 13, marginBottom: 10 }}>{err}</p>}
        <button style={{ ...S.btnPrimary, marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <button style={S.btnOutline} onClick={onGoRegister}>Create Account</button>
      </div>
      <p style={{ textAlign: "center", color: "#444", fontSize: 10, marginTop: 20, letterSpacing: 1.5, textTransform: "uppercase" }}>Secured by Razorpay</p>
    </div>
  );
}

// ── Register ───────────────────────────────────────────────
function RegisterScreen({ onBack }) {
  const [form, setForm] = useState({ email: "", password: "", name: "", profit_account: "" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    if (!form.email || !form.password || !form.name) return setErr("Fill all required fields");
    const r = api.register(form.email, form.password, form.name, form.profit_account);
    if (r.success) setSuccess(true); else setErr(r.message);
  };

  if (success) return (
    <div style={{ padding: "80px 24px", textAlign: "center", background: "#000", minHeight: "100vh" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ ...metalGrad, marginBottom: 8 }}>Account Created</h2>
      <p style={{ color: "#888" }}>You can now sign in.</p>
      <button style={{ ...S.btnPrimary, marginTop: 24 }} onClick={onBack}>Go to Sign In</button>
    </div>
  );

  return (
    <div style={{ padding: "40px 24px 30px", background: "#000", minHeight: "100vh" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#C0C0C0", fontSize: 15, cursor: "pointer", marginBottom: 20 }}>← Back</button>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 900, ...metalGrad }}>Create Account</h2>
      <div style={S.cardMetal}>
        {[["name","Full Name","text"],["email","your@email.com","email"],["password","••••••••","password"],["profit_account","Optional — bank / UPI","text"]].map(([k, ph, type]) => (
          <div key={k}>
            <label style={S.label}>{k === "profit_account" ? "Profit Account" : k}</label>
            <input style={S.input} type={type} placeholder={ph} value={form[k]} onChange={set(k)} />
          </div>
        ))}
        {err && <p style={{ color: "#FF1744", fontSize: 13, marginBottom: 10 }}>{err}</p>}
        <button style={S.btnPrimary} onClick={submit}>Register</button>
      </div>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────
function HomeScreen({ customer, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const acc = api.getAccount(customer.id).account;
  const pkg = acc.package_info;

  const doTrade = () => {
    setLoading(true); setResult(null);
    setTimeout(() => { const r = api.aiTrade(customer.id); setLoading(false); setResult(r); onRefresh(); }, 1800);
  };

  return (
    <div style={{ padding: "24px 20px 90px", background: "radial-gradient(ellipse at 50% -20%, #00BFFF06 0%, transparent 50%), #000", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoMark size={36} />
          <div>
            <p style={{ margin: 0, color: "#888", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Welcome</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{acc.name}</p>
          </div>
        </div>
        <span style={S.tag("#00BFFF")}>{pkg.name}</span>
      </div>

      <div style={{ ...S.cardMetal, marginBottom: 12 }}>
        <p style={{ margin: "0 0 4px", color: "#888", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Portfolio Balance</p>
        <p style={{ margin: "0 0 20px", fontSize: 36, fontWeight: 900, ...metalGrad }}>
          ₹{acc.money.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: "#00E67610", border: "1px solid #00E67622", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <p style={{ margin: 0, color: "#00E676", fontSize: 16, fontWeight: 800 }}>₹{(acc.money * 0.8).toFixed(0)}</p>
            <p style={{ margin: "3px 0 0", color: "#888", fontSize: 10, letterSpacing: 1 }}>TRADING 80%</p>
          </div>
          <div style={{ flex: 1, background: "#C0C0C010", border: "1px solid #2A2A2A", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <p style={{ margin: 0, color: "#C0C0C0", fontSize: 16, fontWeight: 800 }}>₹{(acc.money * 0.2).toFixed(0)}</p>
            <p style={{ margin: "3px 0 0", color: "#888", fontSize: 10, letterSpacing: 1 }}>BACKUP 20%</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ ...S.card, flex: 1, marginBottom: 0, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: acc.total_profit >= 0 ? "#00E676" : "#FF1744" }}>
            {acc.total_profit >= 0 ? "+" : ""}₹{acc.total_profit.toFixed(0)}
          </p>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>Total P&L</p>
        </div>
        <div style={{ ...S.card, flex: 1, marginBottom: 0, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#00BFFF" }}>{acc.trades_left === 9999 ? "∞" : acc.trades_left}</p>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>Trades Left</p>
        </div>
      </div>

      <button
        style={{ ...S.btnAccent, padding: "20px 0", fontSize: 18, borderRadius: 16, opacity: loading ? 0.7 : 1, marginBottom: 16, boxShadow: loading ? "none" : "0 0 32px #00BFFF44, 0 4px 16px #00BFFF22" }}
        onClick={doTrade} disabled={loading}
      >
        {loading ? "⚡ AI Analysing Markets…" : "⚡ AI TRADE NOW"}
      </button>

      {result && (
        <div style={{ ...S.card, border: `1px solid ${result.success && result.trade ? "#00E67633" : "#FF174433"}`, animation: "fadeIn 0.4s ease" }}>
          {result.success && result.trade ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#00E676", letterSpacing: 1 }}>TRADE EXECUTED</span>
                <span style={S.tag(result.trade.news_type === "GOOD" ? "#00E676" : "#888")}>{result.trade.news_type}</span>
              </div>
              <p style={{ margin: "0 0 14px", fontWeight: 900, fontSize: 22, ...metalGrad }}>{result.trade.ticker}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, background: "#00E67610", border: "1px solid #00E67622", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ margin: 0, color: "#00E676", fontWeight: 800 }}>₹{result.trade.invest_amount.toFixed(0)}</p>
                  <p style={{ margin: 0, color: "#888", fontSize: 10, letterSpacing: 1 }}>INVESTED</p>
                </div>
                <div style={{ flex: 1, background: "#C0C0C008", border: "1px solid #2A2A2A", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ margin: 0, color: "#C0C0C0", fontWeight: 800 }}>₹{result.trade.backup_amount.toFixed(0)}</p>
                  <p style={{ margin: 0, color: "#888", fontSize: 10, letterSpacing: 1 }}>BACKUP</p>
                </div>
              </div>
              <div style={{ background: (result.trade.profit >= 0 ? "#00E676" : "#FF1744") + "10", border: `1px solid ${result.trade.profit >= 0 ? "#00E676" : "#FF1744"}33`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 24, color: result.trade.profit >= 0 ? "#00E676" : "#FF1744" }}>
                  {result.trade.profit >= 0 ? "+" : ""}₹{result.trade.profit.toFixed(2)}
                </p>
                <p style={{ margin: "2px 0 0", color: "#888", fontSize: 11 }}>{result.trade.profit_pct}% return</p>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontWeight: 700, color: "#FF1744", textAlign: "center" }}>{result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Money ──────────────────────────────────────────────
function AddMoneyScreen({ customer, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState(null);
  const [paying, setPaying] = useState(false);
  const acc = api.getAccount(customer.id).account;

  const handlePay = async () => {
    const n = Number(amount);
    if (!n || n < 10) return setMsg({ type: "err", text: "Minimum deposit is ₹10" });
    setPaying(true); setMsg(null);
    await initiateRazorpayPayment({
      amount: n, customerName: acc.name, customerEmail: acc.email,
      onSuccess: (paymentId) => {
        const r = api.addMoney(customer.id, n);
        setPaying(false);
        if (r.success) { setMsg({ type: "ok", text: `₹${n} added to wallet` }); setAmount(""); onSuccess(); }
        else setMsg({ type: "err", text: r.message });
      },
      onFailure: (reason) => { setPaying(false); setMsg({ type: "err", text: reason }); },
    });
  };

  return (
    <div style={{ padding: "24px 20px 90px", minHeight: "100vh", background: "#000" }}>
      <h2 style={{ marginBottom: 4, fontWeight: 900, ...metalGrad }}>Add Money</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Balance: ₹{acc.money.toLocaleString("en-IN")}</p>
      <div style={S.cardMetal}>
        <label style={S.label}>Amount (₹)</label>
        <input style={{ ...S.input, fontSize: 24, fontWeight: 800, textAlign: "center" }} type="number" placeholder="0" value={amount} onChange={(e) => { setAmount(e.target.value); setMsg(null); }} min="10" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[500, 1000, 5000, 10000].map((q) => (
            <button key={q} style={{ background: Number(amount) === q ? "#00BFFF22" : "#1A1A1A", border: `1px solid ${Number(amount) === q ? "#00BFFF" : "#2A2A2A"}`, borderRadius: 8, color: Number(amount) === q ? "#00BFFF" : "#C0C0C0", fontSize: 13, fontWeight: 700, padding: "8px 14px", cursor: "pointer" }} onClick={() => { setAmount(q); setMsg(null); }}>
              ₹{q.toLocaleString()}
            </button>
          ))}
        </div>
        {msg && <p style={{ color: msg.type === "ok" ? "#00E676" : "#FF1744", fontSize: 13, marginBottom: 10 }}>{msg.text}</p>}
        <button style={{ ...S.btnPrimary, opacity: paying ? 0.7 : 1 }} onClick={handlePay} disabled={paying || !amount || Number(amount) <= 0}>
          {paying ? "Opening payment…" : `Pay ₹${Number(amount) > 0 ? Number(amount).toLocaleString("en-IN") : "—"} via Razorpay`}
        </button>
      </div>
      <div style={S.card}>
        <p style={{ margin: "0 0 12px", color: "#888", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Accepted Methods</p>
        {[["📱","UPI — GPay, PhonePe, Paytm"],["💳","Credit / Debit — Visa, Mastercard, RuPay"],["🏦","Net Banking — All major banks"],["👛","Wallets — Mobikwik, Airtel"],["📋","EMI — 3 to 12 months"]].map(([icon, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #2A2A2A" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 18 }}>🔒</p>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>PCI DSS compliant · Powered by <span style={{ color: "#C0C0C0" }}>Razorpay</span></p>
      </div>
    </div>
  );
}

// ── Packages ───────────────────────────────────────────────
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
    <div style={{ padding: "24px 20px 90px", minHeight: "100vh", background: "#000" }}>
      <h2 style={{ marginBottom: 4, fontWeight: 900, ...metalGrad }}>Packages</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Balance: ₹{acc.money.toLocaleString("en-IN")}</p>
      {msg && <p style={{ color: msg.type === "ok" ? "#00E676" : "#FF1744", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{msg.text}</p>}
      {Object.entries(PACKAGES).map(([key, info]) => {
        const isCurrent = acc.package === key;
        const isBest = key === "gold";
        return (
          <div key={key} style={{ ...S.cardMetal, border: `1px solid ${isCurrent ? "#00BFFF" : isBest ? "#3A3A3A" : "#2A2A2A"}`, position: "relative" }}>
            {isBest && <span style={{ ...S.tag("#C0C0C0"), position: "absolute", top: 16, right: 16 }}>★ BEST</span>}
            {info.disc && <span style={{ ...S.tag("#00E676"), marginBottom: 8, display: "inline-block" }}>{info.disc}</span>}
            <p style={{ margin: "6px 0 2px", fontWeight: 900, fontSize: 18, ...metalGrad }}>{info.name}</p>
            <p style={{ margin: "0 0 8px", color: "#888", fontSize: 13 }}>{info.trades === 9999 ? "Unlimited trades/day" : `${info.trades} trades/day`}</p>
            <p style={{ margin: "0 0 10px" }}>
              <span style={{ fontSize: 24, fontWeight: 900, ...metalGrad }}>₹{info.price.toLocaleString()}</span>
              {info.original && <span style={{ color: "#444", fontSize: 13, marginLeft: 8, textDecoration: "line-through" }}>₹{info.original}</span>}
              <span style={{ color: "#888", fontSize: 11 }}>/mo</span>
            </p>
            <div style={S.divider} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {info.features.map((f) => <span key={f} style={S.tag("#888")}>{f}</span>)}
            </div>
            {isCurrent ? (
              <div style={{ textAlign: "center", color: "#00BFFF", fontWeight: 700, fontSize: 12, padding: "10px 0", letterSpacing: 1.5, textTransform: "uppercase" }}>✓ Active Plan</div>
            ) : (
              <button style={{ ...S.btnPrimary, opacity: buying === key ? 0.7 : 1 }} onClick={() => buy(key)} disabled={!!buying}>
                {buying === key ? "Processing…" : info.price === 0 ? "Select Free" : `Activate ₹${info.price}`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── History ────────────────────────────────────────────────
function TradeHistoryScreen({ customer }) {
  const { trades } = api.getTrades(customer.id);
  return (
    <div style={{ padding: "24px 20px 90px", minHeight: "100vh", background: "#000" }}>
      <h2 style={{ marginBottom: 20, fontWeight: 900, ...metalGrad }}>Trade History</h2>
      {trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p style={{ color: "#888" }}>No trades yet</p>
        </div>
      ) : trades.map((t) => (
        <div key={t.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 900, fontSize: 16, ...metalGrad }}>{t.ticker}</span>
            <span style={S.tag(t.profit >= 0 ? "#00E676" : "#FF1744")}>{t.profit >= 0 ? "+" : ""}₹{t.profit.toFixed(0)}</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Price", `₹${t.price.toLocaleString("en-IN")}`],["Invested", `₹${t.invest_amount.toFixed(0)}`],["Return", `${t.profit_pct}%`]].map(([label, val]) => (
              <div key={label}>
                <p style={{ margin: 0, color: "#888", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 13 }}>{val}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: "10px 0 0", color: "#444", fontSize: 10 }}>{t.traded_at}</p>
        </div>
      ))}
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────
function ProfileScreen({ customer, onLogout }) {
  const acc = api.getAccount(customer.id).account;
  const pkg = acc.package_info;
  return (
    <div style={{ padding: "24px 20px 90px", minHeight: "100vh", background: "#000" }}>
      <h2 style={{ marginBottom: 20, fontWeight: 900, ...metalGrad }}>Profile</h2>
      <div style={S.cardMetal}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(145deg, #222, #111)", border: "1px solid #3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "inset 0 1px 0 #55555544" }}>
            <span style={{ fontWeight: 900, fontSize: 26, ...metalGrad }}>{acc.name[0].toUpperCase()}</span>
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900 }}>{acc.name}</h3>
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>{acc.email}</p>
        </div>
        <div style={S.divider} />
        {[
          ["Package", <span style={S.tag("#00BFFF")}>{pkg.name}</span>],
          ["Trades Left", acc.trades_left === 9999 ? "Unlimited" : acc.trades_left],
          ["Balance", `₹${acc.money.toLocaleString("en-IN")}`],
          ["Total P&L", <span style={{ color: acc.total_profit >= 0 ? "#00E676" : "#FF1744" }}>{acc.total_profit >= 0 ? "+" : ""}₹{acc.total_profit.toFixed(2)}</span>],
          ["Profit Account", acc.profit_account || "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #2A2A2A" }}>
            <span style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span>
          </div>
        ))}
      </div>
      <button style={{ background: "transparent", border: "1px solid #FF174433", borderRadius: 10, color: "#FF1744", fontSize: 14, fontWeight: 700, padding: "12px 20px", cursor: "pointer" }} onClick={onLogout}>
        Sign Out
      </button>
    </div>
  );
}

// ── Nav + App root ─────────────────────────────────────────
const NAV = [
  { id: "home",     label: "Home",    icon: "⚡" },
  { id: "money",    label: "Deposit", icon: "₹" },
  { id: "packages", label: "Plans",   icon: "◈" },
  { id: "history",  label: "History", icon: "≡" },
  { id: "profile",  label: "Profile", icon: "◉" },
];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("home");
  const [customer, setCustomer] = useState(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  return (
    <div style={S.app}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        input::placeholder { color: #333; }
        input:focus { border-color: #00BFFF55 !important; box-shadow: 0 0 0 2px #00BFFF11; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {screen === "login"    && <LoginScreen onLogin={(c) => { setCustomer(c); setScreen("app"); }} onGoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onBack={() => setScreen("login")} />}
      {screen === "app" && customer && (
        <>
          <div style={{ overflowY: "auto", maxHeight: "100vh" }}>
            {tab === "home"     && <HomeScreen     customer={customer} onRefresh={refresh} key={tick} />}
            {tab === "money"    && <AddMoneyScreen  customer={customer} onSuccess={refresh} />}
            {tab === "packages" && <PackagesScreen  customer={customer} onSuccess={refresh} />}
            {tab === "history"  && <TradeHistoryScreen customer={customer} key={tick} />}
            {tab === "profile"  && <ProfileScreen   customer={customer} onLogout={() => { setCustomer(null); setScreen("login"); setTab("home"); }} key={tick} />}
          </div>
          <nav style={S.navBar}>
            {NAV.map((n) => (
              <button key={n.id} style={S.navItem(tab === n.id)} onClick={() => setTab(n.id)}>
                <span style={{ fontSize: 20, filter: tab === n.id ? "drop-shadow(0 0 6px #00BFFF)" : "none" }}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
