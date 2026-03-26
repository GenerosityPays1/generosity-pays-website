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

  // Lock body scroll when mobile menu is open
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
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "bg-black/30 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
            <Image
              src="/GenPayLogo.png"
              alt="Generosity Pays"
              width={56}
              height={56}
              priority
              className="h-14 w-14 object-contain transition-all duration-300"
              style={scrolled ? undefined : { filter: "brightness(0) invert(1)" }}
            />
            <span className="text-xl font-semibold tracking-tight font-serif">
              <span className={scrolled ? "text-dark" : "text-white"}>Generosity</span>
              <span className={`italic ${scrolled ? "text-dark" : "text-white"}`}> Pays</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              isInternal(link.href) ? (
                <a
                  key={link.label}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    scrolled ? "text-gray-700 hover:bg-primary/5" : "text-white hover:bg-white/15"
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    scrolled ? "text-gray-700 hover:bg-primary/5" : "text-white hover:bg-white/15"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA + Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/merchant-fee-analysis"
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md lg:inline-flex items-center"
            >
              Get Your Free Analysis
            </Link>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors lg:hidden ${
                scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay + Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-[70px] items-center justify-between border-b border-gray-100 px-5">
                <span className="flex items-center gap-2">
                  <Image
                    src="/GenPayLogo.png"
                    alt="Generosity Pays"
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain"
                  />
                  <span className="text-lg font-semibold tracking-tight font-serif text-dark">
                    Generosity <span className="italic">Pays</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Links */}
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

              {/* Drawer CTA */}
              <div className="border-t border-gray-100 p-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.25 }}
                >
                  <Link
                    href="/merchant-fee-analysis"
                    onClick={closeMobile}
                    className="block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
                  >
                    Get Your Free Analysis
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-[70px]" />
    </>
  );
}
