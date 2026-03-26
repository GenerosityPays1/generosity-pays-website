"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Warm gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background:
            "linear-gradient(135deg, #1A1714 0%, #2D2A26 20%, #3D3830 35%, #4A4339 50%, #2D2A26 70%, #1A1714 100%)",
          backgroundSize: "300% 300%",
        }}
      />

      {/* Background stock photo — semi-transparent for texture */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-merchants.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-15 mix-blend-luminosity"
        />
      </div>

      {/* Gold glow overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(196, 162, 101, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Floating decorative shapes — warm gold tones */}
      <div
        className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full opacity-15 animate-float"
        style={{
          background:
            "radial-gradient(circle, rgba(196, 162, 101, 0.4), transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="absolute top-[60%] right-[8%] w-96 h-96 rounded-full opacity-10 animate-float"
        style={{
          background:
            "radial-gradient(circle, rgba(212, 184, 122, 0.4), transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute top-[25%] right-[20%] w-48 h-48 rounded-full opacity-10 animate-float"
        style={{
          background:
            "radial-gradient(circle, rgba(196, 162, 101, 0.3), transparent 70%)",
          animationDelay: "4s",
        }}
      />
      <div
        className="absolute bottom-[15%] left-[15%] w-64 h-64 rounded-full opacity-10 animate-float"
        style={{
          background:
            "radial-gradient(circle, rgba(212, 184, 122, 0.3), transparent 70%)",
          animationDelay: "1s",
        }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo mark */}
        <motion.div variants={fadeUpVariants} className="mb-6">
          <Image
            src="/GenPayLogo.png"
            alt=""
            width={176}
            height={176}
            priority
            className="h-44 w-44 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
          variants={fadeUpVariants}
        >
          Turn Everyday Transactions Into{" "}
          <span className="bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            Meaningful Impact
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mt-6 text-xl md:text-2xl text-gray-300 font-light max-w-2xl leading-relaxed"
          variants={fadeUpVariants}
        >
          Premium payment processing that gives back to the causes you care
          about — at no additional cost.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          variants={fadeUpVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/merchant-fee-analysis"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-dark bg-primary rounded-full shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors duration-300 animate-pulse-glow"
            >
              Get Your Free Analysis
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-primary/40 rounded-full hover:bg-primary/10 hover:border-primary/70 transition-all duration-300 backdrop-blur-sm"
            >
              See How It Works
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll-down indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-primary/50 text-sm font-light tracking-widest uppercase">
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
            className="text-primary/50"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
