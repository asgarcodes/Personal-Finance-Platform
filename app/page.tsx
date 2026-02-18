"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  SpotlightCard,
} from "./components/ui/SpotlightCard";
import {
  Meteors,
  BorderBeam,
  ShimmerButton,
  GlowingBadge,
  NumberTicker,
  GridPattern,
} from "./components/ui/MagicComponents";

const features = [
  {
    icon: "📊",
    title: "Smart Analytics",
    description:
      "AI-powered insights that analyze your spending patterns and give personalized recommendations to grow your wealth.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139, 92, 246, 0.3)",
  },
  {
    icon: "🎯",
    title: "Goal Tracking",
    description:
      "Set financial milestones and watch your progress in real-time with beautiful visualizations and smart nudges.",
    gradient: "from-blue-500 to-cyan-500",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  {
    icon: "🧾",
    title: "Tax Intelligence",
    description:
      "India-specific tax engine comparing Old vs New regime automatically. Never miss a deduction again.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  {
    icon: "💳",
    title: "Budget Planner",
    description:
      "Visual budget management with category-wise breakdowns, alerts, and monthly trend analysis.",
    gradient: "from-orange-500 to-amber-500",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  {
    icon: "📈",
    title: "Investment Tracker",
    description:
      "Monitor your portfolio performance, track SIPs, and get insights on asset allocation.",
    gradient: "from-pink-500 to-rose-500",
    glow: "rgba(236, 72, 153, 0.3)",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description:
      "Bank-grade encryption with Firebase security. Your financial data stays completely private.",
    gradient: "from-indigo-500 to-violet-500",
    glow: "rgba(99, 102, 241, 0.3)",
  },
];

const stats = [
  { value: 50000, label: "Transactions Tracked", prefix: "₹", suffix: "Cr+" },
  { value: 98, label: "Accuracy Rate", suffix: "%" },
  { value: 10000, label: "Active Users", suffix: "+" },
  { value: 4.9, label: "App Rating", suffix: "★" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    avatar: "PS",
    content:
      "This platform completely transformed how I manage my finances. The tax comparison feature alone saved me ₹45,000 last year!",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Rahul Mehta",
    role: "Entrepreneur, Mumbai",
    avatar: "RM",
    content:
      "The investment tracker and goal-based savings have helped me stay disciplined. I've hit 3 of my 5 financial goals this year.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Ananya Patel",
    role: "CA, Ahmedabad",
    avatar: "AP",
    content:
      "As a CA, I recommend this to all my clients. The ITR preparation tools and auto-categorization are incredibly accurate.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Stats", href: "#stats" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="landing-root min-h-screen">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Cursor spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(120,80,255,0.06), transparent 40%)`,
        }}
      />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-[#050508]/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(135deg, #7c5cfc, #60a5fa)",
                boxShadow: "0 0 20px rgba(124, 92, 252, 0.5)",
              }}
            >
              💰
            </div>
            <span className="font-bold text-white text-lg">FinanceIQ</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #7c5cfc 0%, #60a5fa 100%)",
                boxShadow: "0 0 20px rgba(124, 92, 252, 0.35)",
              }}
            >
              Open Dashboard →
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg"
      >
        <GridPattern />
        <Meteors number={15} />

        {/* Glowing orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c5cfc, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <GlowingBadge>🚀 India&apos;s Smartest Finance Platform</GlowingBadge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
          >
            Master Your{" "}
            <span className="shimmer-text">Financial Future</span>
            <br />
            <span className="text-white/80">with AI Intelligence</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Track expenses, optimize taxes, grow investments, and achieve your
            financial goals — all in one beautifully designed platform built for
            India.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full font-bold text-white text-lg relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #7c5cfc 0%, #60a5fa 100%)",
                  boxShadow: "0 0 40px rgba(124, 92, 252, 0.5)",
                }}
              >
                <span className="relative z-10">Start for Free →</span>
              </motion.button>
            </Link>

            <motion.a
              href="#features"
              whileHover={{ scale: 1.03 }}
              className="px-8 py-4 rounded-full font-semibold text-white/70 text-lg border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
            >
              See Features ↓
            </motion.a>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 relative"
          >
            <div
              className="relative rounded-2xl overflow-hidden mx-auto max-w-4xl"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                boxShadow: "0 40px 120px rgba(124, 92, 252, 0.2)",
              }}
            >
              <BorderBeam size={300} duration={12} />
              {/* Mock Dashboard UI */}
              <div className="p-6">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div
                    className="px-4 py-1 rounded-full text-xs text-white/40"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    financeiq.app/dashboard
                  </div>
                  <div className="w-20" />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Income", value: "₹1,20,000", color: "#10b981" },
                    { label: "Expenses", value: "₹68,400", color: "#f43f5e" },
                    { label: "Savings", value: "₹51,600", color: "#7c5cfc" },
                    { label: "Score", value: "82/100", color: "#f59e0b" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <div className="text-xs text-white/40 mb-1">{stat.label}</div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="text-xs text-white/40 mb-3">Monthly Overview</div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${h}%`,
                            background:
                              i === 11
                                ? "linear-gradient(180deg, #7c5cfc, #60a5fa)"
                                : "rgba(124,92,252,0.25)",
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Transaction list */}
                <div className="space-y-2">
                  {[
                    { name: "Salary Credit", cat: "Income", amount: "+₹85,000", color: "#10b981" },
                    { name: "Rent Payment", cat: "Housing", amount: "-₹18,000", color: "#f43f5e" },
                    { name: "Grocery Store", cat: "Food", amount: "-₹3,200", color: "#f43f5e" },
                  ].map((tx) => (
                    <div
                      key={tx.name}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <div>
                        <div className="text-xs text-white/70">{tx.name}</div>
                        <div className="text-xs text-white/30">{tx.cat}</div>
                      </div>
                      <div className="text-xs font-semibold" style={{ color: tx.color }}>
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glow under preview */}
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl opacity-30"
              style={{ background: "linear-gradient(90deg, #7c5cfc, #60a5fa)" }}
            />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/30">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
                  <NumberTicker
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 relative">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120,80,255,0.08), transparent)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <GlowingBadge>✨ Everything You Need</GlowingBadge>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
              Powerful Features,{" "}
              <span className="gradient-text">Simple Interface</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              From daily expense tracking to complex tax planning — we&apos;ve got
              every aspect of your financial life covered.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <SpotlightCard
                  className="p-6 h-full"
                  spotlightColor={feature.glow}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br ${feature.gradient}`}
                    style={{ boxShadow: `0 8px 20px ${feature.glow}` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <GlowingBadge>⚡ Quick Start</GlowingBadge>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
              Up and Running in{" "}
              <span className="gradient-text">3 Minutes</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Data",
                desc: "Add your income and expenses manually or let our smart categorization do the work.",
                icon: "🔗",
              },
              {
                step: "02",
                title: "Get AI Insights",
                desc: "Our engine analyzes your patterns and gives personalized recommendations instantly.",
                icon: "🧠",
              },
              {
                step: "03",
                title: "Achieve Your Goals",
                desc: "Follow the roadmap, track progress, and celebrate every financial milestone.",
                icon: "🏆",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(124,92,252,0.5), transparent)",
                    }}
                  />
                )}
                <div
                  className="relative z-10 p-6 rounded-2xl text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="text-5xl font-black mb-4 gradient-text opacity-30"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <GlowingBadge>💬 Loved by Users</GlowingBadge>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-4">
              Real People,{" "}
              <span className="gradient-text">Real Results</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <SpotlightCard className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${t.gradient}`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-white/40">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
                  <p className="text-white/60 text-sm leading-relaxed">&quot;{t.content}&quot;</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(120,80,255,0.12), transparent)",
          }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Ready to take{" "}
              <span className="shimmer-text">control</span>
              <br />
              of your finances?
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Join thousands of Indians who are already building wealth smarter.
              No credit card required.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-5 rounded-full font-bold text-white text-xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #7c5cfc 0%, #60a5fa 100%)",
                  boxShadow: "0 0 60px rgba(124, 92, 252, 0.5)",
                }}
              >
                Get Started Free →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-12 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg, #7c5cfc, #60a5fa)" }}
            >
              💰
            </div>
            <span className="font-bold text-white">FinanceIQ</span>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 FinanceIQ. Built with ❤️ for India.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Support"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/30 hover:text-white/60 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
