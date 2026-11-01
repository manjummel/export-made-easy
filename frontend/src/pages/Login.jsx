/**
 * ============================================================
 * ExportEase AI — Cinematic Login / Register Page
 * Full sync with AuthContext -> authService -> backend /api/v1/auth
 * ============================================================
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Mail, Lock, Eye, EyeOff, User, Building2,
  ArrowRight, Sparkles, Globe, Shield, TrendingUp,
  ChevronRight, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CinematicBackground } from "../components/layout";

/* Animation Variants */
const PAGE_ENTER = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};
const CARD_ENTER = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
  },
};
const STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
};
const FIELD_ENTER = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};
const STAT_STAGGER = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.8 } },
};
const STAT_ITEM = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function AnimatedInput({ id, type = "text", placeholder, value, onChange, icon: Icon, error, rightElement, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
        style={{
          background: focused ? "linear-gradient(135deg, rgba(23,70,210,0.15), rgba(59,130,246,0.08))" : "transparent",
          border: `1px solid ${focused ? "rgba(59,130,246,0.6)" : error ? "rgba(220,38,38,0.5)" : "var(--color-border-medium)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
        }}
      />
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 pointer-events-none">
            <Icon size={16} style={{ color: focused ? "#60a5fa" : error ? "#f87171" : "var(--color-muted)" }} className="transition-colors duration-200" />
          </div>
        )}
        <input
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
          disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-3.5 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none disabled:opacity-50 font-medium"
          style={{ paddingLeft: Icon ? "2.75rem" : "1rem" }}
        />
        {rightElement && <div className="absolute right-4">{rightElement}</div>}
      </div>
    </div>
  );
}

const STATS = [
  { icon: Globe, label: "Export Markets", value: "180+" },
  { icon: TrendingUp, label: "MSMEs Served", value: "12,000+" },
  { icon: Shield, label: "Compliance Rate", value: "99.8%" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    confirmPassword: "",
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!form.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (mode === "register") {
      if (!form.fullName) return "Full name is required";
      if (form.password !== form.confirmPassword) return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setIsLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const result = await login(form.email, form.password);
        if (result?.user) {
          setSuccess("Welcome back! Redirecting…");
          setTimeout(() => navigate("/", { replace: true }), 800);
        } else { setError("Invalid credentials. Please try again."); }
      } else {
        const result = await register({ email: form.email, password: form.password, fullName: form.fullName, companyName: form.companyName });
        if (result) {
          setSuccess("Account created! Logging you in…");
          await login(form.email, form.password);
          setTimeout(() => navigate("/onboarding", { replace: true }), 800);
        } else { setError("Registration failed. Please try again."); }
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true); setError("");
    const result = await login("usha@exportease.ai", "ExportEase@2026");
    if (result?.user) { setSuccess("Demo session started!"); setTimeout(() => navigate("/", { replace: true }), 700); }
    setIsLoading(false);
  };

  return (
    <motion.div className="relative min-h-screen w-full flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }} {...PAGE_ENTER}>
      {/* Cinematic Adaptive Background */}
      <CinematicBackground />

      {/* Left Hero */}
      <div className="relative z-10 hidden lg:flex flex-col justify-between w-[55%] p-14">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20" style={{ background: "linear-gradient(135deg, #1746d2, #3b82f6)" }}>
            <Compass size={20} color="white" />
          </div>
          <div>
            <span className="text-[var(--text-primary)] font-bold text-lg tracking-tight">ExportEase</span>
            <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>AI</span>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div className="space-y-5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(23,70,210,0.25)", color: "#93c5fa", border: "1px solid rgba(59,130,246,0.35)" }}>
              <Sparkles size={12} />AI-Powered Export Intelligence
            </div>
            <h1 className="text-5xl font-extrabold leading-tight text-[var(--text-primary)] tracking-tight">
              Your gateway to<br />
              <span style={{ background: "linear-gradient(90deg, #60a5fa, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>global markets</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-md font-medium">
              Empower your MSME with real-time trade intelligence, automated compliance, and AI-driven export roadmaps tailored for Indian exporters.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-3 gap-4" variants={STAT_STAGGER} initial="initial" animate="animate">
            {STATS.map(({ icon: Icon, label, value }) => (
              <motion.div key={label} variants={STAT_ITEM} className="rounded-2xl p-4 bg-[var(--surface-card)] border border-[var(--border-medium)] backdrop-blur-xl shadow-lg">
                <Icon size={18} style={{ color: "#60a5fa", marginBottom: "8px" }} />
                <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{value}</div>
                <div className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="space-y-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}>
            {["HS Code Finder with AI classification", "Automated compliance & document generation", "Live market intelligence across 180+ countries"].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] font-medium">
                <CheckCircle2 size={15} style={{ color: "#34d399", flexShrink: 0 }} />{feat}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div className="text-[var(--text-muted)] text-xs font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          © 2026 ExportEase AI · Trusted by 12,000+ Indian MSMEs
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full lg:w-[45%] p-6 sm:p-10">
        <motion.div className="flex lg:hidden items-center gap-2 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20" style={{ background: "linear-gradient(135deg, #1746d2, #3b82f6)" }}><Compass size={18} color="white" /></div>
          <span className="text-[var(--text-primary)] font-bold text-lg">ExportEase AI</span>
        </motion.div>

        <motion.div className="w-full max-w-md rounded-3xl p-8 sm:p-10 bg-[var(--surface-card)] border border-[var(--border-medium)] backdrop-blur-2xl shadow-2xl" {...CARD_ENTER}>
          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-8 bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
            {["login", "register"].map((tab) => (
              <button key={tab} onClick={() => { setMode(tab); setError(""); setSuccess(""); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-300 cursor-pointer"
                style={{ background: mode === tab ? "linear-gradient(135deg, #1746d2, #2563eb)" : "transparent", color: mode === tab ? "#fff" : "var(--color-muted)", boxShadow: mode === tab ? "0 4px 16px rgba(23,70,210,0.4)" : "none" }}>
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mb-7">
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{mode === "login" ? "Welcome back" : "Start your export journey"}</h2>
              <p className="text-[var(--text-secondary)] text-sm font-medium mt-1.5">{mode === "login" ? "Sign in to your ExportEase AI dashboard" : "Create your free account and go global"}</p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate>
            <AnimatePresence mode="wait">
              <motion.div key={mode} className="space-y-4" variants={STAGGER_CHILDREN} initial="initial" animate="animate">
                {mode === "register" && (
                  <>
                    <motion.div variants={FIELD_ENTER}><AnimatedInput id="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange("fullName")} icon={User} disabled={isLoading} /></motion.div>
                    <motion.div variants={FIELD_ENTER}><AnimatedInput id="companyName" placeholder="Company name (optional)" value={form.companyName} onChange={handleChange("companyName")} icon={Building2} disabled={isLoading} /></motion.div>
                  </>
                )}
                <motion.div variants={FIELD_ENTER}><AnimatedInput id="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange("email")} icon={Mail} error={error} disabled={isLoading} /></motion.div>
                <motion.div variants={FIELD_ENTER}>
                  <AnimatedInput id="password" type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={handleChange("password")} icon={Lock} error={error} disabled={isLoading}
                    rightElement={<button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">{showPassword ? <EyeOff size={15} className="text-primary" /> : <Eye size={15} className="text-primary" />}</button>}
                  />
                </motion.div>
                {mode === "register" && (
                  <motion.div variants={FIELD_ENTER}><AnimatedInput id="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} icon={Lock} error={error} disabled={isLoading} /></motion.div>
                )}
                {mode === "login" && (
                  <motion.div variants={FIELD_ENTER} className="flex justify-end">
                    <button type="button" className="text-xs font-medium transition-colors" style={{ color: "rgba(96,165,250,0.8)" }}>Forgot password?</button>
                  </motion.div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />{error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
                      <CheckCircle2 size={15} className="flex-shrink-0" />{success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={FIELD_ENTER}>
                  <button type="submit" disabled={isLoading} className="relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-primary overflow-hidden transition-all duration-300 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #1746d2, #2563eb, #3b82f6)", boxShadow: "0 8px 32px rgba(23,70,210,0.45)" }}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><span>{mode === "login" ? "Sign In" : "Create Account"}</span><ArrowRight size={16} /></>}
                  </button>
                </motion.div>

                <motion.div variants={FIELD_ENTER} className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <span className="text-xs text-primary/30">or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                </motion.div>

                <motion.div variants={FIELD_ENTER}>
                  <button type="button" onClick={handleDemoLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                    <Sparkles size={15} style={{ color: "#fbbf24" }} />
                    Continue with Demo Account
                    <ChevronRight size={14} />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </form>

          <motion.p className="text-center text-xs mt-7" style={{ color: "rgba(255,255,255,0.22)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            By continuing you agree to our <span className="underline cursor-pointer" style={{ color: "rgba(96,165,250,0.6)" }}>Terms</span> and <span className="underline cursor-pointer" style={{ color: "rgba(96,165,250,0.6)" }}>Privacy Policy</span>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
