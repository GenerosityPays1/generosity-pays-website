"use client";

import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HiCheck, HiExclamation, HiUpload, HiDocument } from "react-icons/hi";

const benefits = [
  "Complete processing review",
  "Hidden fee identification",
  "Charitable impact overview",
  "Personalized service assessment",
  "No obligation consultation",
];

const flags = [
  "Non-qualified surcharges",
  "High interchange rates",
  "Monthly service fees",
  "PCI compliance fees",
  "Batch processing fees",
  "Hidden markups",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function MerchantFeeAnalysis() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    monthlyVolume: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ".pdf,.png,.jpg,.doc,.docx";

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("business_name", formData.businessName);
      body.append("email", formData.email);
      body.append("phone", formData.phone);
      body.append("monthly_volume", formData.monthlyVolume);
      body.append("lead_type", "fee_analysis");
      body.append("page_source", window.location.pathname);
      if (file) {
        body.append("statement", file);
      }

      const res = await fetch("/api/leads", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || "Something went wrong. Please try again."
        );
      }

      setStatus("success");
      setFormData({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        monthlyVolume: "",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <section className="min-h-screen bg-warm pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Free Processing Analysis
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Upload your processing statement and our experts will review your
            setup, identify opportunities, and show you how your business can
            give back.
          </p>
        </motion.div>

        {/* Header accent image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative mb-12 h-40 w-full overflow-hidden rounded-2xl sm:h-48"
        >
          <Image
            src="/images/fee-analysis-hero.jpg"
            alt="Detailed financial statement review and analysis"
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-warm/60 via-transparent to-warm/60" />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          {/* LEFT COLUMN - Lead Capture Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="rounded-2xl bg-white p-8 shadow-lg"
            >
              {/* Hidden lead type */}
              <input type="hidden" name="leadType" value="fee_analysis" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="fee-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fee-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className={inputClasses}
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label
                    htmlFor="fee-business"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fee-business"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Your business name"
                    className={inputClasses}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="fee-email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fee-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@company.com"
                    className={inputClasses}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="fee-phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fee-phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Monthly Card Volume */}
              <div className="mt-5">
                <label
                  htmlFor="fee-volume"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Monthly Card Volume <span className="text-red-500">*</span>
                </label>
                <input
                  id="fee-volume"
                  name="monthlyVolume"
                  type="number"
                  required
                  value={formData.monthlyVolume}
                  onChange={handleInputChange}
                  placeholder="e.g. 50000"
                  className={inputClasses}
                />
              </div>

              {/* File Upload - Drag & Drop Zone */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Upload Processing Statement (Optional)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : file
                        ? "border-secondary bg-secondary/5"
                        : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <HiDocument className="h-10 w-10 text-secondary" />
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="mt-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <HiUpload className="h-10 w-10 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Drag and drop your file here, or{" "}
                        <span className="text-primary">browse</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, PNG, JPG, DOC, or DOCX
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={status === "loading"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-dark shadow-lg shadow-primary/25 transition-colors duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Analyzing...
                  </span>
                ) : (
                  "Get My Free Analysis"
                )}
              </motion.button>

              {/* Success State */}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                >
                  Your statement has been received. Our team will review and
                  send a full breakdown shortly.
                </motion.div>
              )}

              {/* Error State */}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {errorMessage}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* RIGHT COLUMN - Benefits Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <div className="space-y-10">
              {/* What You'll Get */}
              <div>
                <h2 className="mb-5 text-xl font-bold text-gray-900">
                  What You&apos;ll Get
                </h2>
                <motion.ul
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {benefits.map((benefit) => (
                    <motion.li
                      key={benefit}
                      variants={listItem}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <HiCheck className="h-4 w-4 text-primary" />
                      </span>
                      <span className="text-gray-700">{benefit}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* What We Look For */}
              <div>
                <h2 className="mb-5 text-xl font-bold text-gray-900">
                  What We Look For
                </h2>
                <motion.ul
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {flags.map((flag) => (
                    <motion.li
                      key={flag}
                      variants={listItem}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <HiExclamation className="h-4 w-4 text-amber-600" />
                      </span>
                      <span className="text-gray-700">{flag}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Questions CTA */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <p className="mb-2 text-lg font-semibold text-gray-900">
                  Questions?
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  Our team is here to help you understand your processing and its impact.
                </p>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Contact Us
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
