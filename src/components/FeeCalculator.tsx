"use client";

import { useState, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  onChange,
}: SliderInputProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(Math.min(max, Math.max(min, val)));
          }}
          className={`w-full rounded-lg border border-gray-300 bg-white py-3 text-gray-900 font-medium shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            prefix ? "pl-8 pr-3" : "px-4"
          } ${suffix ? "pr-8" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>
          {prefix}{min.toLocaleString()}{suffix}
        </span>
        <span>
          {prefix}{max.toLocaleString()}{suffix}
        </span>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

export default function FeeCalculator() {
  const [volume, setVolume] = useState(50000);
  const [avgTransaction, setAvgTransaction] = useState(50);
  const [currentRate, setCurrentRate] = useState(2.9);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const results = useMemo(() => {
    const currentFees = volume * (currentRate / 100);
    const gpRate = currentRate * 0.75;
    const gpFees = volume * (gpRate / 100);
    const monthlySavings = currentFees - gpFees;
    const annualSavings = monthlySavings * 12;

    return { currentFees, gpRate, gpFees, monthlySavings, annualSavings };
  }, [volume, currentRate]);

  const resultCards = [
    {
      title: "Current Monthly Fees",
      value: results.currentFees,
      classes: "bg-red-50 border border-red-100",
      textClass: "text-red-700",
    },
    {
      title: "With Generosity Pays",
      value: results.gpFees,
      classes: "bg-primary/5 border border-primary/10",
      textClass: "text-primary",
    },
    {
      title: "Monthly Savings",
      value: results.monthlySavings,
      classes: "bg-primary/5 border border-primary/10",
      textClass: "text-primary",
    },
    {
      title: "Annual Savings",
      value: results.annualSavings,
      classes: "bg-primary/5 border-2 border-primary/20 ring-2 ring-primary/10",
      textClass: "text-primary",
      highlighted: true,
    },
  ];

  return (
    <section id="calculator" ref={sectionRef} className="relative bg-warm py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Instant Fee Savings Calculator
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            See how much you could save with Generosity Pays
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as const }}
            className="rounded-2xl bg-white p-8 shadow-lg"
          >
            <h3 className="mb-8 text-xl font-semibold text-gray-900">
              Enter Your Details
            </h3>
            <div className="space-y-8">
              <SliderInput
                label="Monthly Card Volume ($)"
                value={volume}
                min={5000}
                max={500000}
                step={1000}
                prefix="$"
                onChange={setVolume}
              />
              <SliderInput
                label="Average Transaction Size ($)"
                value={avgTransaction}
                min={5}
                max={500}
                step={1}
                prefix="$"
                onChange={setAvgTransaction}
              />
              <SliderInput
                label="Current Processing Rate (%)"
                value={currentRate}
                min={1}
                max={5}
                step={0.1}
                suffix="%"
                onChange={setCurrentRate}
              />
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" as const }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {resultCards.map((card, i) => (
                <div
                  key={card.title}
                  className={`relative overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${card.classes}`}
                >
                  {card.highlighted && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-dark">
                      Best Value
                    </div>
                  )}
                  <p className="mb-2 text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <div className={`text-3xl font-bold ${card.textClass} ${card.highlighted ? "lg:text-4xl" : ""}`}>
                    {formatCurrency(card.value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Fee Comparison
              </h4>
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Current Fees</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(results.currentFees)}/mo
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Generosity Pays</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(results.gpFees)}/mo
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-light to-primary transition-all duration-500"
                      style={{
                        width: `${results.currentFees > 0 ? (results.gpFees / results.currentFees) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary/5 py-3">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-primary">
                    You save 25% on processing fees
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" as const }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-gray-500">
            Want a detailed breakdown tailored to your business?
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/merchant-fee-analysis"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark"
            >
              Get A Full Free Fee Analysis
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
