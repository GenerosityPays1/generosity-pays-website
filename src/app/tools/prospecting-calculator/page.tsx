"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function currency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function pct(n: number) {
  return `${n.toFixed(2)}%`;
}

export default function ProspectingCalculatorPage() {
  const [totalMonthlySales, setTotalMonthlySales] = useState("");
  const [avgSaleAmount, setAvgSaleAmount] = useState("");
  const [transactionsPerMonth, setTransactionsPerMonth] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [currentCostPerTxn, setCurrentCostPerTxn] = useState("");
  const [quotedRate, setQuotedRate] = useState("");
  const [quotedCostPerTxn, setQuotedCostPerTxn] = useState("");
  const [cashDiscount, setCashDiscount] = useState(false);

  const sales = parseFloat(totalMonthlySales) || 0;
  const txns = parseFloat(transactionsPerMonth) || 0;
  const curRate = parseFloat(currentRate) || 0;
  const curPerTxn = parseFloat(currentCostPerTxn) || 0;
  const ourRate = parseFloat(quotedRate) || 0;
  const ourPerTxn = parseFloat(quotedCostPerTxn) || 0;

  const currentMonthlyCost = sales * (curRate / 100) + txns * curPerTxn;
  const quotedMonthlyCost = cashDiscount
    ? 0
    : sales * (ourRate / 100) + txns * ourPerTxn;
  const monthlySavings = currentMonthlyCost - quotedMonthlyCost;
  const annualSavings = monthlySavings * 12;

  const hasInput = sales > 0 || txns > 0;
  const hasSavings = monthlySavings > 0;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[16px]";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  function handleReset() {
    setTotalMonthlySales("");
    setAvgSaleAmount("");
    setTransactionsPerMonth("");
    setCurrentRate("");
    setCurrentCostPerTxn("");
    setQuotedRate("");
    setQuotedCostPerTxn("");
    setCashDiscount(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/TransparentLogo.png"
              alt="Generosity Pays"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
            <span className="text-base font-bold tracking-tight text-dark">
              GP Quote Tool
            </span>
          </Link>
          <button
            onClick={handleReset}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Merchant Info */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
            Current Processing
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="totalMonthlySales" className={labelClass}>
                Total Monthly Sales
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  id="totalMonthlySales"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={totalMonthlySales}
                  onChange={(e) => setTotalMonthlySales(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="avgSaleAmount" className={labelClass}>
                Average Sale Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  id="avgSaleAmount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={avgSaleAmount}
                  onChange={(e) => setAvgSaleAmount(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="transactionsPerMonth" className={labelClass}>
                Number of Transactions Per Month
              </label>
              <input
                id="transactionsPerMonth"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="0"
                value={transactionsPerMonth}
                onChange={(e) => setTransactionsPerMonth(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="currentRate" className={labelClass}>
                  Current Processing Rate
                </label>
                <div className="relative">
                  <input
                    id="currentRate"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(e.target.value)}
                    className={`${inputClass} pr-8`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="currentCostPerTxn" className={labelClass}>
                  Current Cost / Transaction
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    id="currentCostPerTxn"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={currentCostPerTxn}
                    onChange={(e) => setCurrentCostPerTxn(e.target.value)}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Quote */}
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
            Our Quote
          </h2>

          {cashDiscount ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-700">
                Cash Discount / Dual Pricing Active
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                Processing fees are passed to card-paying customers.
                The business pays $0 in processing fees.
              </p>
              <p className="mt-3 text-2xl font-extrabold text-emerald-700">
                $0.00 / mo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quotedRate" className={labelClass}>
                  Our Quoted Rate
                </label>
                <div className="relative">
                  <input
                    id="quotedRate"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    value={quotedRate}
                    onChange={(e) => setQuotedRate(e.target.value)}
                    className={`${inputClass} pr-8 border-primary/20 focus:border-primary`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="quotedCostPerTxn" className={labelClass}>
                  Our Cost / Transaction
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    id="quotedCostPerTxn"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={quotedCostPerTxn}
                    onChange={(e) => setQuotedCostPerTxn(e.target.value)}
                    className={`${inputClass} pl-8 border-primary/20 focus:border-primary`}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCashDiscount(!cashDiscount)}
            className={`mt-4 w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
              cashDiscount
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                : "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
            }`}
          >
            {cashDiscount
              ? "Switch Back to Custom Quote"
              : "Cash Discount / Dual Pricing — Eliminate Fees"}
          </button>
        </div>

        {/* Results */}
        {hasInput && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Their Current Cost/mo
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-700">
                    {currency(currentMonthlyCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">
                    {cashDiscount ? "With Cash Discount" : "Our Quoted Cost/mo"}
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary">
                    {currency(quotedMonthlyCost)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-5 shadow-sm ${
                hasSavings
                  ? "border-emerald-200 bg-emerald-50"
                  : monthlySavings < 0
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      hasSavings
                        ? "text-emerald-600"
                        : monthlySavings < 0
                          ? "text-red-600"
                          : "text-gray-400"
                    }`}
                  >
                    Monthly Savings
                  </p>
                  <p
                    className={`mt-1 text-2xl font-extrabold ${
                      hasSavings
                        ? "text-emerald-700"
                        : monthlySavings < 0
                          ? "text-red-700"
                          : "text-gray-500"
                    }`}
                  >
                    {currency(monthlySavings)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      hasSavings
                        ? "text-emerald-600"
                        : monthlySavings < 0
                          ? "text-red-600"
                          : "text-gray-400"
                    }`}
                  >
                    Annual Savings
                  </p>
                  <p
                    className={`mt-1 text-2xl font-extrabold ${
                      hasSavings
                        ? "text-emerald-700"
                        : monthlySavings < 0
                          ? "text-red-700"
                          : "text-gray-500"
                    }`}
                  >
                    {currency(annualSavings)}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Breakdown
              </h3>
              {cashDiscount ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current rate fees/mo</span>
                    <span className="font-semibold text-gray-700">
                      {currency(sales * (curRate / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current per-txn fees/mo</span>
                    <span className="font-semibold text-gray-700">
                      {currency(txns * curPerTxn)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-500">With cash discount</span>
                    <span className="font-semibold text-emerald-600">
                      $0.00
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                    Card-paying customers cover the processing fee. The business
                    keeps 100% of every sale.
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate savings</span>
                    <span className="font-semibold text-gray-700">
                      {pct(curRate)} → {pct(ourRate)}{" "}
                      <span
                        className={
                          curRate > ourRate ? "text-emerald-600" : "text-red-500"
                        }
                      >
                        ({curRate > ourRate ? "−" : "+"}
                        {pct(Math.abs(curRate - ourRate))})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate cost difference/mo</span>
                    <span className="font-semibold text-gray-700">
                      {currency(sales * (curRate / 100) - sales * (ourRate / 100))}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per-txn savings</span>
                    <span className="font-semibold text-gray-700">
                      ${curPerTxn.toFixed(2)} → ${ourPerTxn.toFixed(2)}{" "}
                      <span
                        className={
                          curPerTxn > ourPerTxn
                            ? "text-emerald-600"
                            : "text-red-500"
                        }
                      >
                        ({curPerTxn > ourPerTxn ? "−" : "+"}$
                        {Math.abs(curPerTxn - ourPerTxn).toFixed(2)})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Per-txn cost difference/mo
                    </span>
                    <span className="font-semibold text-gray-700">
                      {currency(txns * curPerTxn - txns * ourPerTxn)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
