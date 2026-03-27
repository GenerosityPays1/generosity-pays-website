"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import CountUp from "react-countup";
import { useInView as useInViewObserver } from "react-intersection-observer";
import {
  HiUserGroup,
  HiHeart,
  HiSparkles,
  HiLightningBolt,
  HiLocationMarker,
  HiGift,
  HiGlobeAlt,
  HiClipboardList,
} from "react-icons/hi";
import { IconType } from "react-icons";

/* ------------------------------------------------------------------ */
/*  Animation variants (matching Hero.tsx patterns)                    */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface SignatureElement {
  icon: IconType;
  title: string;
  description: string;
}

const signatureElements: SignatureElement[] = [
  {
    icon: HiUserGroup,
    title: "Celebrate Survivors",
    description:
      "Honor those who have battled cancer and celebrate their strength and courage.",
  },
  {
    icon: HiHeart,
    title: "Celebrate Caregivers",
    description:
      "Recognize the caregivers who provide unwavering love and support.",
  },
  {
    icon: HiSparkles,
    title: "Remember Loved Ones",
    description:
      "The luminaria ceremony honors those we've lost and lights the way forward.",
  },
  {
    icon: HiLightningBolt,
    title: "Fight Back",
    description:
      "Take action and commit to doing more to help end cancer for good.",
  },
];

interface PartnershipCard {
  icon: IconType;
  title: string;
  description: string;
}

const partnershipCards: PartnershipCard[] = [
  {
    icon: HiLocationMarker,
    title: "Visit Our Tent",
    description:
      "Stop by the Generosity Pays tent to meet our team and learn about payment processing with purpose.",
  },
  {
    icon: HiGift,
    title: "Learn How Giving Works",
    description:
      "Discover how every transaction through Generosity Pays supports charitable causes at no additional cost to your business.",
  },
  {
    icon: HiGlobeAlt,
    title: "Join The Mission",
    description:
      "See how your business can turn everyday payments into meaningful impact for communities in need.",
  },
];

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const acsStats: Stat[] = [
  { value: 110, suffix: "+", label: "Years Fighting Cancer" },
  { value: 31, suffix: "", label: "Countries Worldwide" },
  { value: 1, suffix: "M+", label: "Lives Touched" },
];

/* ------------------------------------------------------------------ */
/*  Stat counter sub-component                                         */
/* ------------------------------------------------------------------ */

function StatCounter({ stat, delay }: { stat: Stat; delay: number }) {
  const { ref, inView } = useInViewObserver({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="text-center"
    >
      <p className="text-3xl font-bold text-acs-purple sm:text-4xl">
        {inView ? (
          <CountUp end={stat.value} duration={2.5} />
        ) : (
          "0"
        )}
        <span>{stat.suffix}</span>
      </p>
      <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Volunteer form sub-component                                       */
/* ------------------------------------------------------------------ */

const availabilityOptions = [
  { value: "", label: "Select your availability" },
  { value: "Full Day", label: "Full Day" },
  { value: "Morning Shift", label: "Morning Shift" },
  { value: "Afternoon Shift", label: "Afternoon Shift" },
  { value: "Evening Shift", label: "Evening Shift" },
  { value: "Flexible", label: "Flexible" },
];

function VolunteerForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    experience: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          page_source: window.location.pathname,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-lg text-center min-h-[400px]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <HiHeart className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-gray-900">Thank You!</h3>
        <p className="max-w-sm text-gray-600">
          We&apos;ll be in touch with more details about the event. We appreciate
          your willingness to volunteer!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-8 shadow-lg"
    >
      <h3 className="mb-6 text-xl font-bold text-gray-900">
        Sign Up To Volunteer
      </h3>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="vol-name" className="mb-1 block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="vol-name"
            name="name"
            type="text"
            required
            maxLength={200}
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="vol-email" className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="vol-email"
            name="email"
            type="email"
            required
            maxLength={254}
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="you@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="vol-phone" className="mb-1 block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="vol-phone"
            name="phone"
            type="tel"
            maxLength={30}
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="vol-availability" className="mb-1 block text-sm font-medium text-gray-700">
            Availability
          </label>
          <select
            id="vol-availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {availabilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Experience / Skills */}
        <div>
          <label htmlFor="vol-experience" className="mb-1 block text-sm font-medium text-gray-700">
            Experience / Skills
          </label>
          <textarea
            id="vol-experience"
            name="experience"
            rows={3}
            maxLength={1000}
            value={formData.experience}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Tell us about any relevant experience or skills..."
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="vol-notes" className="mb-1 block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="vol-notes"
            name="notes"
            rows={3}
            maxLength={2000}
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Anything else you'd like us to know..."
          />
        </div>
      </div>

      {/* Error message */}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-full bg-primary px-8 py-3 text-base font-semibold text-dark shadow-sm transition-all hover:bg-primary-dark hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </span>
        ) : (
          "Sign Up To Volunteer"
        )}
      </button>
    </form>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function RelayForLife() {
  const aboutRef = useRef<HTMLElement>(null);
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });

  return (
    <>
      {/* ============================================================ */}
      {/*  SECTION 1 — Hero Banner                                     */}
      {/* ============================================================ */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        {/* Purple-to-dark gradient background */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background:
              "linear-gradient(135deg, #3D1A4A 0%, #2D1535 20%, #1A1714 50%, #2D1535 80%, #3D1A4A 100%)",
            backgroundSize: "300% 300%",
          }}
        />

        {/* Subtle texture overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-merchants.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-10 mix-blend-luminosity"
          />
        </div>

        {/* Purple glow overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(123, 45, 142, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Floating decorative shapes — purple tones */}
        <div
          className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full opacity-15 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(123, 45, 142, 0.4), transparent 70%)",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute right-[8%] top-[60%] h-96 w-96 rounded-full opacity-10 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(155, 77, 176, 0.4), transparent 70%)",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute right-[20%] top-[25%] h-48 w-48 rounded-full opacity-10 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(196, 162, 101, 0.3), transparent 70%)",
            animationDelay: "4s",
          }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] h-64 w-64 rounded-full opacity-10 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(123, 45, 142, 0.3), transparent 70%)",
            animationDelay: "1s",
          }}
        />

        {/* Main content */}
        <motion.div
          className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Partnership badge */}
          <motion.div variants={fadeUpVariants}>
            <span className="inline-flex items-center gap-2 rounded-full bg-acs-purple/20 px-4 py-1.5 text-sm font-medium text-acs-purple-light backdrop-blur-sm">
              <HiHeart className="h-4 w-4" />
              Community Partnership
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            variants={fadeUpVariants}
          >
            Fighting Cancer,{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
              One Transaction At A Time
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-gray-300 md:text-xl"
            variants={fadeUpVariants}
          >
            Generosity Pays is proud to partner with the American Cancer Society
            at Relay For Life — the world&apos;s largest fundraiser to end
            cancer.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            variants={fadeUpVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#partnership"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark animate-pulse-glow"
              >
                Visit Us At Relay For Life
              </a>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#about-acs"
                className="inline-flex items-center justify-center rounded-full border-2 border-acs-purple/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-acs-purple-light hover:bg-acs-purple/10"
              >
                Learn About ACS
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <span className="text-sm font-light uppercase tracking-widest text-acs-purple-light/50">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-acs-purple-light/50"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — About the American Cancer Society               */}
      {/* ============================================================ */}
      <section id="about-acs" ref={aboutRef} className="bg-warm py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={
                aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
              }
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-acs-purple">
                About Our Partner
              </span>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The American Cancer Society
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 1913, the American Cancer Society has spent over a
                  century improving the lives of people with cancer and their
                  families. What started as a small group of physicians and
                  businessmen has grown into one of the most impactful health
                  organizations in the world.
                </p>
                <p>
                  Their mission is clear: to improve the lives of people with
                  cancer and their families through advocacy, research, and
                  patient support — ensuring everyone has an opportunity to
                  prevent, detect, treat, and survive cancer.
                </p>
                <p>
                  From funding groundbreaking research to providing free rides to
                  treatment and 24/7 support, the American Cancer Society is at
                  the forefront of every aspect of the cancer fight.
                </p>
              </div>

              {/* Stats row */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                {acsStats.map((stat, i) => (
                  <StatCounter key={stat.label} stat={stat} delay={i * 0.15} />
                ))}
              </div>
            </motion.div>

            {/* Right — Decorative card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={
                aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
              }
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-acs-purple/20 bg-gradient-to-br from-acs-purple/5 via-white to-primary/5 p-10 shadow-lg">
                {/* Decorative glow */}
                <div
                  className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(123, 45, 142, 0.4), transparent 70%)",
                  }}
                />
                <div
                  className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-15"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(196, 162, 101, 0.4), transparent 70%)",
                  }}
                />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-acs-purple/10">
                    <HiHeart className="h-7 w-7 text-acs-purple" />
                  </div>
                  <blockquote className="text-xl font-medium italic leading-relaxed text-gray-800">
                    &ldquo;No one should have to face cancer alone.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-acs-purple">
                    American Cancer Society
                  </p>
                  <div className="mt-8 h-px bg-gradient-to-r from-acs-purple/20 via-primary/20 to-transparent" />
                  <p className="mt-6 text-sm leading-relaxed text-gray-500">
                    The American Cancer Society provides free lodging near
                    treatment centers, a 24/7 helpline, free rides to treatment,
                    and funds critical research to find cures — all made possible
                    by community support.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — What Is Relay For Life                          */}
      {/* ============================================================ */}
      <section
        id="relay-for-life"
        className="relative overflow-hidden py-24"
        style={{
          background:
            "linear-gradient(135deg, #1A1714 0%, #2D2A26 50%, #1A1714 100%)",
        }}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0">
          <Image
            src="/images/features-business.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.05] mix-blend-luminosity"
          />
        </div>

        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(123, 45, 142, 0.2), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-acs-purple-light">
              The Event
            </span>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What Is Relay For Life?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              The world&apos;s largest fundraiser to end cancer — bringing
              communities together to celebrate, remember, and fight back.
            </p>
          </motion.div>

          {/* Four signature element cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signatureElements.map((element, index) => {
              const Icon = element.icon;
              return (
                <motion.div
                  key={element.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.12,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-acs-purple/30 hover:bg-white/10"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-acs-purple/20 text-acs-purple-light transition-colors duration-300 group-hover:bg-acs-purple group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {element.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {element.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Event description callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mx-auto mt-14 max-w-3xl rounded-2xl border border-acs-purple/20 bg-acs-purple/5 px-8 py-6 text-center backdrop-blur-sm"
          >
            <p className="text-base leading-relaxed text-gray-300">
              At Relay For Life events, communities come together to honor
              survivors, remember those we&apos;ve lost, and raise funds for
              groundbreaking cancer research, patient care programs, and
              life-saving education. It&apos;s more than an event — it&apos;s a
              movement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4 — Volunteer Sign-Up                               */}
      {/* ============================================================ */}
      <section id="volunteer" className="bg-warm py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Left — Info (2 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-2"
            >
              <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary-dark">
                Get Involved
              </span>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Volunteer With Us
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                Join the Generosity Pays team at Relay For Life. We&apos;re
                looking for enthusiastic volunteers to help run our booth and
                share our mission with the community.
              </p>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  What You&apos;ll Do
                </h3>
                {[
                  "Greet visitors and share information",
                  "Help set up and manage the booth",
                  "Connect with local business owners",
                  "Represent Generosity Pays at the event",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <HiClipboardList className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Form (3 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-3"
            >
              <VolunteerForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5 — Generosity Pays Partnership                     */}
      {/* ============================================================ */}
      <section id="partnership" className="bg-warm py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary-dark">
              Our Involvement
            </span>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Generosity Pays At Relay For Life
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-500">
              We&apos;re proud to be part of this incredible event. Visit our
              tent to learn how your business can make a difference.
            </p>
          </motion.div>

          {/* Partnership cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {partnershipCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="leading-relaxed text-gray-500">
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Accent callout banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-14 overflow-hidden rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, #5E1F6E 0%, #7B2D8E 30%, #A8893F 70%, #C4A265 100%)",
            }}
          >
            <div className="px-8 py-8 text-center sm:px-12">
              <p className="text-xl font-semibold text-white sm:text-2xl">
                Every transaction through Generosity Pays helps fund the fight
                against cancer.
              </p>
              <p className="mt-2 text-sm text-white/70">
                Premium payment processing that gives back — at no additional
                cost to your business.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6 — Call To Action                                  */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden py-24"
        style={{
          background:
            "linear-gradient(135deg, #2D1535 0%, #3D1A4A 30%, #1A1714 70%, #2D2A26 100%)",
        }}
      >
        {/* Decorative glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(123, 45, 142, 0.3), transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(196, 162, 101, 0.3), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Be Part Of Something Bigger
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-300">
              Whether you&apos;re a business owner looking for payment processing
              with purpose, or a community member wanting to support the fight
              against cancer — we&apos;d love to connect with you.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/merchant-fee-analysis"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark animate-pulse-glow"
                >
                  Get Your Free Analysis
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
