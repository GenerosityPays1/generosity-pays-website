"use client";

import { useState, useCallback, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import {
  HiOutlineCalculator,
  HiOutlineUserCircle,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineHeart,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineDocumentArrowDown,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

// ─── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_GP_RATE = 4.0;
const MIN_GP_RATE = 3.0;
const GP_RATE_STEP = 0.1;
const GP_RESIDUAL = 0.75;
const CHARITY_DONATION_RATE = 0.10;

const STEPS = [
  { label: "Your Fees", icon: HiOutlineCalculator },
  { label: "Your Info", icon: HiOutlineUserCircle },
  { label: "Your Savings", icon: HiOutlineChartBar },
];

const TRUST_ITEMS = [
  {
    icon: HiOutlineShieldCheck,
    title: "Transparent Pricing",
    desc: "No hidden fees, no long-term contracts.",
  },
  {
    icon: HiOutlineHeart,
    title: "Purpose-Driven",
    desc: "A portion of every transaction supports causes you choose.",
  },
  {
    icon: HiOutlineClock,
    title: "Quick Onboarding",
    desc: "Most merchants are up and running within 48 hours.",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CalcData {
  monthlyVolume: string;
  avgTransaction: string;
  currentRate: string;
  monthlyTransactions: string;
}

interface ContactData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function currency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function computeSavings(calc: CalcData, gpRate: number) {
  const vol = parseFloat(calc.monthlyVolume) || 0;
  const rate = parseFloat(calc.currentRate) || 0;
  const currentFees = vol * (rate / 100);
  const gpFees = vol * (gpRate / 100);
  const monthlySavings = Math.max(currentFees - gpFees, 0);
  const annualSavings = monthlySavings * 12;
  const monthlyDonation = gpFees * GP_RESIDUAL * CHARITY_DONATION_RATE;
  const annualDonation = monthlyDonation * 12;
  return { currentFees, gpFees, monthlySavings, annualSavings, monthlyDonation, annualDonation };
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function SavingsCalculatorPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [gpRate, setGpRate] = useState(DEFAULT_GP_RATE);

  const [calc, setCalc] = useState<CalcData>({
    monthlyVolume: "",
    avgTransaction: "",
    currentRate: "",
    monthlyTransactions: "",
  });

  const [contact, setContact] = useState<ContactData>({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const savings = computeSavings(calc, gpRate);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleCalcSubmit = (e: FormEvent) => {
    e.preventDefault();
    goNext();
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/calculator-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: contact.businessName,
          contact_name: contact.contactName,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes,
          monthly_volume: parseFloat(calc.monthlyVolume) || 0,
          avg_transaction: parseFloat(calc.avgTransaction) || 0,
          current_rate: parseFloat(calc.currentRate) || 0,
          monthly_transactions: parseInt(calc.monthlyTransactions) || 0,
          current_monthly_fees: savings.currentFees,
          estimated_monthly_savings: savings.monthlySavings,
          estimated_annual_savings: savings.annualSavings,
          charity_impact: savings.monthlyDonation,
          gp_rate: gpRate,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      setSubmitted(true);
      goNext();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const restoreStep = () => {
      setStep(stepRef.current);
    };
    window.addEventListener("afterprint", restoreStep);
    return () => window.removeEventListener("afterprint", restoreStep);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ─── Input classes ──────────────────────────────────────────────────────────

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[16px]";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/TransparentLogo.png"
              alt="Generosity Pays"
              width={44}
              height={44}
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-dark">
              Generosity Pays
            </span>
          </Link>
          <Link
            href="/#contact"
            className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:inline-flex"
          >
            <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
            Contact Us
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-14"
        >
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-dark sm:text-4xl lg:text-5xl">
            Merchant Fee Savings Calculator
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-500 sm:text-lg">
            See how much your business could save on processing fees — and how
            those savings can make a real impact in your community.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-10 flex items-center justify-center gap-0 sm:mb-14">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.label} className="flex items-center">
                {i > 0 && (
                  <div
                    className={`mx-1 h-0.5 w-8 rounded-full transition-colors duration-500 sm:mx-3 sm:w-16 ${
                      isComplete ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-12 sm:w-12 ${
                      isActive
                        ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                        : isComplete
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    {isComplete ? (
                      <HiOutlineCheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-primary"
                        : isComplete
                          ? "text-primary/70"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="relative min-h-[520px] sm:min-h-[480px]">
          <AnimatePresence custom={direction} mode="wait">
            {/* ─── Step 1: Calculator ─────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="calc"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
                  {/* Form */}
                  <form
                    ref={formRef}
                    onSubmit={handleCalcSubmit}
                    className="lg:col-span-3"
                  >
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                      <h2 className="mb-1 text-xl font-bold text-dark">
                        Tell us about your processing
                      </h2>
                      <p className="mb-6 text-sm text-gray-500">
                        Enter your current payment processing details to see
                        your potential savings.
                      </p>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="monthlyVolume" className={labelClass}>
                            <HiOutlineCurrencyDollar className="mr-1 inline h-4 w-4 text-primary" />
                            Total Monthly Sales
                          </label>
                          <p className="text-xs text-gray-400 mb-1.5 -mt-0.5">
                            How much do you process in card payments each month?
                          </p>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              $
                            </span>
                            <input
                              id="monthlyVolume"
                              type="number"
                              required
                              min="1"
                              step="any"
                              placeholder="50,000"
                              value={calc.monthlyVolume}
                              onChange={(e) =>
                                setCalc((c) => ({
                                  ...c,
                                  monthlyVolume: e.target.value,
                                }))
                              }
                              className={`${inputClass} pl-8`}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="avgTransaction"
                            className={labelClass}
                          >
                            Average Sale Amount
                          </label>
                          <p className="text-xs text-gray-400 mb-1.5 -mt-0.5">
                            What does a typical customer spend per visit?
                          </p>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              $
                            </span>
                            <input
                              id="avgTransaction"
                              type="number"
                              required
                              min="0.01"
                              step="any"
                              placeholder="45"
                              value={calc.avgTransaction}
                              onChange={(e) =>
                                setCalc((c) => ({
                                  ...c,
                                  avgTransaction: e.target.value,
                                }))
                              }
                              className={`${inputClass} pl-8`}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="currentRate" className={labelClass}>
                            Current Processing Rate
                          </label>
                          <p className="text-xs text-gray-400 mb-1.5 -mt-0.5">
                            The % your processor charges per transaction
                          </p>
                          <div className="relative">
                            <input
                              id="currentRate"
                              type="number"
                              required
                              min="0"
                              max="10"
                              step="0.01"
                              placeholder="3.25"
                              value={calc.currentRate}
                              onChange={(e) =>
                                setCalc((c) => ({
                                  ...c,
                                  currentRate: e.target.value,
                                }))
                              }
                              className={`${inputClass} pr-8`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="monthlyTransactions"
                            className={labelClass}
                          >
                            Number of Transactions per Month
                          </label>
                          <p className="text-xs text-gray-400 mb-1.5 -mt-0.5">
                            How many card payments do you run each month?
                          </p>
                          <input
                            id="monthlyTransactions"
                            type="number"
                            required
                            min="1"
                            placeholder="1,200"
                            value={calc.monthlyTransactions}
                            onChange={(e) =>
                              setCalc((c) => ({
                                ...c,
                                monthlyTransactions: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>

                        {/* GP Rate — inline for mobile, also in sidebar for desktop */}
                        <div className="sm:col-span-2 lg:hidden">
                          <label className={labelClass}>Your Quoted Rate</label>
                          <p className="text-xs text-gray-400 mb-1.5 -mt-0.5">
                            Adjust the rate you&apos;ve been quoted
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setGpRate((r) =>
                                  Math.max(
                                    MIN_GP_RATE,
                                    Math.round((r - GP_RATE_STEP) * 100) / 100
                                  )
                                )
                              }
                              disabled={gpRate <= MIN_GP_RATE}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-white text-lg font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              &minus;
                            </button>
                            <span className="text-2xl font-extrabold text-primary">
                              {gpRate.toFixed(1)}%
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setGpRate((r) =>
                                  Math.round((r + GP_RATE_STEP) * 100) / 100
                                )
                              }
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-white text-lg font-bold text-primary transition-colors hover:bg-primary/10"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live preview */}
                      {parseFloat(calc.monthlyVolume) > 0 &&
                        parseFloat(calc.currentRate) > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-6 rounded-xl bg-warm p-5"
                          >
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Estimated preview
                            </p>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Current Fees/mo
                                </p>
                                <p className="text-lg font-bold text-dark">
                                  {currency(savings.currentFees)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  GP Fees/mo
                                </p>
                                <p className="text-lg font-bold text-primary">
                                  {currency(savings.gpFees)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Potential Savings/mo
                                </p>
                                <p className="text-lg font-bold text-emerald-600">
                                  {currency(savings.monthlySavings)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      <button
                        type="submit"
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                      >
                        See My Savings
                        <HiOutlineArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </form>

                  {/* Trust sidebar */}
                  <div className="hidden lg:col-span-2 lg:block">
                    <div className="space-y-5">
                      {TRUST_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                          >
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="mb-1 text-sm font-bold text-dark">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </motion.div>
                        );
                      })}

                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                          Your Rate
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setGpRate((r) =>
                                Math.max(
                                  MIN_GP_RATE,
                                  Math.round((r - GP_RATE_STEP) * 100) / 100
                                )
                              )
                            }
                            disabled={gpRate <= MIN_GP_RATE}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white text-lg font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            &minus;
                          </button>
                          <span className="min-w-[4.5rem] text-3xl font-extrabold text-primary">
                            {gpRate.toFixed(1)}%
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setGpRate((r) =>
                                Math.round((r + GP_RATE_STEP) * 100) / 100
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white text-lg font-bold text-primary transition-colors hover:bg-primary/10"
                          >
                            +
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Adjust your quoted rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Contact Info ───────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="contact"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <div className="mx-auto max-w-2xl">
                  <form
                    onSubmit={handleContactSubmit}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                  >
                    <h2 className="mb-1 text-xl font-bold text-dark">
                      Almost there — tell us about your business
                    </h2>
                    <p className="mb-6 text-sm text-gray-500">
                      We&apos;ll prepare a personalized savings report and
                      follow up with next steps.
                    </p>

                    {/* Summary chip */}
                    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-warm p-4">
                      <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm">
                        <HiOutlineCurrencyDollar className="h-4 w-4 text-primary" />
                        <span className="font-medium text-dark">
                          {currency(savings.monthlySavings)}/mo
                        </span>
                        <span className="text-gray-400">savings</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm">
                        <HiOutlineChartBar className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-dark">
                          {currency(savings.annualSavings)}/yr
                        </span>
                        <span className="text-gray-400">annually</span>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="businessName"
                          className={labelClass}
                        >
                          <HiOutlineBuildingStorefront className="mr-1 inline h-4 w-4 text-primary" />
                          Business Name
                        </label>
                        <input
                          id="businessName"
                          type="text"
                          required
                          value={contact.businessName}
                          onChange={(e) =>
                            setContact((c) => ({
                              ...c,
                              businessName: e.target.value,
                            }))
                          }
                          placeholder="Acme Coffee Shop"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contactName"
                          className={labelClass}
                        >
                          <HiOutlineUserCircle className="mr-1 inline h-4 w-4 text-primary" />
                          Contact Name
                        </label>
                        <input
                          id="contactName"
                          type="text"
                          required
                          value={contact.contactName}
                          onChange={(e) =>
                            setContact((c) => ({
                              ...c,
                              contactName: e.target.value,
                            }))
                          }
                          placeholder="Jane Smith"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className={labelClass}>
                          <HiOutlineEnvelope className="mr-1 inline h-4 w-4 text-primary" />
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={contact.email}
                          onChange={(e) =>
                            setContact((c) => ({
                              ...c,
                              email: e.target.value,
                            }))
                          }
                          placeholder="jane@acmecoffee.com"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className={labelClass}>
                          <HiOutlinePhone className="mr-1 inline h-4 w-4 text-primary" />
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            setContact((c) => ({
                              ...c,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="(555) 123-4567"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label htmlFor="notes" className={labelClass}>
                        Notes (optional)
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={contact.notes}
                        onChange={(e) =>
                          setContact((c) => ({
                            ...c,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Anything you'd like us to know — current processor, contract end date, etc."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {submitError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                      >
                        {submitError}
                      </motion.p>
                    )}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto"
                      >
                        <HiOutlineArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Preparing Report…
                          </>
                        ) : (
                          <>
                            View My Savings Report
                            <HiOutlineArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ─── Step 3: Results ────────────────────────────────────── */}
            {step === 2 && submitted && (
              <motion.div
                key="results"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="print:p-0"
              >
                <ResultsView
                  calc={calc}
                  contact={contact}
                  savings={savings}
                  gpRate={gpRate}
                  onPrint={handlePrint}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-gray-200 bg-white py-8 print:hidden">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center text-xs text-gray-400 sm:px-6">
          <Image
            src="/TransparentLogo.png"
            alt="Generosity Pays"
            width={28}
            height={28}
            className="opacity-50"
          />
          <p>
            &copy; {new Date().getFullYear()} Generosity Pays. All rights
            reserved.
          </p>
          <p>
            This calculator provides estimates based on the information you
            provide. Actual savings may vary.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Results View ───────────────────────────────────────────────────────────────

function ResultsView({
  calc,
  contact,
  savings,
  gpRate,
  onPrint,
}: {
  calc: CalcData;
  contact: ContactData;
  savings: ReturnType<typeof computeSavings>;
  gpRate: number;
  onPrint: () => void;
}) {
  const { ref: countRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const maxBar = savings.currentFees;

  return (
    <div className="space-y-8">
      {/* Hero stats */}
      <div
        ref={countRef}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">
              Your Savings Report
            </h2>
            <p className="text-sm text-gray-500">
              Prepared for {contact.businessName}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Current Monthly Fees"
            color="text-gray-700"
            bg="bg-gray-50"
          >
            {inView && (
              <CountUp
                end={savings.currentFees}
                prefix="$"
                separator=","
                duration={1.5}
                className="text-2xl font-extrabold"
              />
            )}
          </StatCard>

          <StatCard
            label="GP Monthly Fees"
            color="text-primary"
            bg="bg-primary/5"
          >
            {inView && (
              <CountUp
                end={savings.gpFees}
                prefix="$"
                separator=","
                duration={1.5}
                className="text-2xl font-extrabold"
              />
            )}
          </StatCard>

          <StatCard
            label="Monthly Savings"
            color="text-emerald-600"
            bg="bg-emerald-50"
          >
            {inView && (
              <CountUp
                end={savings.monthlySavings}
                prefix="$"
                separator=","
                duration={1.8}
                className="text-2xl font-extrabold"
              />
            )}
          </StatCard>

          <StatCard
            label="Annual Savings"
            color="text-emerald-700"
            bg="bg-emerald-50 border border-emerald-200"
          >
            {inView && (
              <CountUp
                end={savings.annualSavings}
                prefix="$"
                separator=","
                duration={2}
                className="text-3xl font-extrabold"
              />
            )}
          </StatCard>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Monthly comparison chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-base font-bold text-dark">
            Monthly Fee Comparison
          </h3>
          <div className="space-y-4">
            <BarRow
              label="Current Processor"
              sublabel={`${parseFloat(calc.currentRate).toFixed(2)}%`}
              value={savings.currentFees}
              max={maxBar}
              color="bg-gray-400"
            />
            <BarRow
              label="Generosity Pays"
              sublabel={`${gpRate.toFixed(1)}%`}
              value={savings.gpFees}
              max={maxBar}
              color="bg-primary"
            />
            <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">
                Your Monthly Savings
              </span>
              <span className="text-lg font-bold text-emerald-700">
                {currency(savings.monthlySavings)}
              </span>
            </div>
          </div>
        </div>

        {/* Annual projection chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-base font-bold text-dark">
            12-Month Savings Projection
          </h3>
          <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 180 }}>
            {months.map((m, i) => {
              const cumSavings = savings.monthlySavings * (i + 1);
              const barHeight = Math.round((cumSavings / savings.annualSavings) * 160);
              return (
                <div key={m} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: 180 }}>
                  <div
                    className="absolute -top-8 hidden rounded-lg bg-dark px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block"
                  >
                    {currency(cumSavings)}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary-light"
                  />
                  <span className="mt-2 text-[10px] text-gray-400">{m}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium text-primary">
              Total Annual Savings
            </span>
            <span className="text-lg font-bold text-primary">
              {currency(savings.annualSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* Charitable Impact */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-warm to-primary/5 p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <HiOutlineHeart className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-dark">
            Your Impact Through Generosity Pays
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-500">
            Generosity Pays donates 10% of the revenue we earn from your
            account directly to a charity or nonprofit of your choice.
            Here&apos;s what your partnership could mean:
          </p>

          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Estimated Monthly Donation
              </p>
              <p className="mt-2 text-3xl font-extrabold text-primary">
                {inView ? (
                  <CountUp
                    end={savings.monthlyDonation}
                    prefix="$"
                    separator=","
                    decimals={0}
                    duration={1.8}
                  />
                ) : (
                  "$0"
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                donated every month to your chosen cause
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Estimated Annual Donation
              </p>
              <p className="mt-2 text-3xl font-extrabold text-primary">
                {inView ? (
                  <CountUp
                    end={savings.annualDonation}
                    prefix="$"
                    separator=","
                    decimals={0}
                    duration={2}
                  />
                ) : (
                  "$0"
                )}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                your business could give back this year
              </p>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-xs text-gray-400">
            You choose the nonprofit — whether it&apos;s a local community
            organization, the American Cancer Society, Special Olympics, or any
            cause close to your heart.
          </p>
        </div>
      </div>

      {/* Processing details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-dark">
          Your Processing Summary
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <DetailRow
            label="Total Monthly Sales"
            value={currency(parseFloat(calc.monthlyVolume) || 0)}
          />
          <DetailRow
            label="Avg. Sale Amount"
            value={currency(parseFloat(calc.avgTransaction) || 0)}
          />
          <DetailRow
            label="Transactions per Month"
            value={(
              parseInt(calc.monthlyTransactions) || 0
            ).toLocaleString()}
          />
          <DetailRow
            label="Current Rate"
            value={`${parseFloat(calc.currentRate).toFixed(2)}%`}
          />
          <DetailRow
            label="GP Rate"
            value={`${gpRate.toFixed(1)}%`}
            highlight
          />
          <DetailRow
            label="Rate Savings"
            value={`${(
              (parseFloat(calc.currentRate) || 0) - gpRate
            ).toFixed(2)}%`}
            highlight
          />
        </div>
      </div>

      {/* CTAs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 print:hidden">
        <div className="text-center">
          <h3 className="mb-2 text-xl font-bold text-dark">
            Ready to start saving?
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            Schedule a free consultation and we&apos;ll walk you through the
            switch — no pressure, no obligations.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://www.generositypays.net/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl"
            >
              <HiOutlineCalendarDays className="h-5 w-5" />
              Schedule a Consultation
            </a>
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              <HiOutlineDocumentArrowDown className="h-5 w-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  color,
  bg,
  children,
}: {
  label: string;
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-5 ${bg}`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <div className={color}>{children}</div>
    </div>
  );
}

function BarRow({
  label,
  sublabel,
  value,
  max,
  color,
}: {
  label: string;
  sublabel: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-700">
          {label}{" "}
          <span className="text-xs text-gray-400">({sublabel})</span>
        </span>
        <span className="text-sm font-bold text-gray-900">
          {currency(value)}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-semibold ${highlight ? "text-primary" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
