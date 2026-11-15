"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Solutions", href: "#features" },
  { label: "Free Analysis", href: "/merchant-fee-analysis" },
  { label: "Relay For Life", href: "/relay-for-life" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const CTA_LABEL = "Free Analysis";
const CTA_HREF = "/merchant-fee-analysis";

const ArrowUpRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const isInternal = (href: string) => href.startsWith("#");

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 h-[70px] transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={closeMobile}
          >
            <Image
              src="/GenPayLogo.png"
              alt="Generosity Pays"
              width={56}
              height={56}
              priority
              className="h-14 w-14 object-contain transition-all duration-300"
              style={scrolled ? undefined : { filter: "brightness(0) invert(1)" }}
            />
            <span className="font-serif text-xl font-semibold tracking-tight">
              <span className={scrolled ? "text-dark" : "text-white"}>
                Generosity
              </span>
              <span
                className={`italic ${scrolled ? "text-dark" : "text-white"}`}
              >
                {" "}
                Pays
              </span>
            </span>
          </Link>

          {/* Desktop pill nav */}
          <nav className="hidden xl:flex items-center">
            <div
              className={`flex items-center gap-1 rounded-full px-1 py-1 ring-1 backdrop-blur transition-all duration-300 ${
                scrolled
                  ? "bg-white/70 ring-gray-200"
                  : "bg-white/5 ring-white/10"
              }`}
            >
              {navLinks.map((link) => {
                const className = `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-700 hover:bg-primary/10 hover:text-primary-dark"
                    : "text-white hover:bg-white/15"
                }`;
                return isInternal(link.href) ? (
                  <a key={link.label} href={link.href} className={className}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className={className}>
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={CTA_HREF}
                className={`ml-1 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  scrolled
                    ? "bg-primary text-dark hover:bg-primary-dark"
                    : "bg-white text-neutral-900 hover:bg-white/90"
                }`}
              >
                {CTA_LABEL}
                <ArrowUpRight />
              </Link>
            </div>
          </nav>

          {/* Mobile hamburger — circular */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 backdrop-blur transition-colors xl:hidden ${
              scrolled
                ? "bg-white/80 ring-gray-200 text-dark hover:bg-gray-100"
                : "bg-white/10 ring-white/15 text-white hover:bg-white/15"
            }`}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <HiX className="h-5 w-5" />
            ) : (
              <HiMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-2xl xl:hidden"
            >
              <div className="flex h-[70px] items-center justify-between border-b border-gray-100 px-5">
                <span className="flex items-center gap-2">
                  <Image
                    src="/GenPayLogo.png"
                    alt="Generosity Pays"
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain"
                  />
                  <span className="font-serif text-lg font-semibold tracking-tight text-dark">
                    Generosity <span className="italic">Pays</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
                {navLinks.map((link, i) => {
                  const linkContent = (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.25 }}
                    >
                      {isInternal(link.href) ? (
                        <a
                          href={link.href}
                          onClick={closeMobile}
                          className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={closeMobile}
                          className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                  return <div key={link.label}>{linkContent}</div>;
                })}
              </nav>

              <div className="border-t border-gray-100 p-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.25 }}
                >
                  <Link
                    href={CTA_HREF}
                    onClick={closeMobile}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-center text-sm font-semibold text-dark shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
                  >
                    {CTA_LABEL}
                    <ArrowUpRight />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so hero isn't hidden behind the fixed nav */}
      <div className="h-[70px]" />
    </>
  );
}
