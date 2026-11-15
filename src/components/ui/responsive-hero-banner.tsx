"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface TrustBadge {
  label: string;
}

export interface ResponsiveHeroBannerProps {
  backgroundImageUrl: string;
  badgeLabel?: string;
  badgeText?: string;
  title: string;
  titleLine2?: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  trustTitle?: string;
  trustBadges?: TrustBadge[];
}

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
  </svg>
);

export default function ResponsiveHeroBanner({
  backgroundImageUrl,
  badgeLabel,
  badgeText,
  title,
  titleLine2,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  trustTitle,
  trustBadges,
}: ResponsiveHeroBannerProps) {
  const isInternalHref = (href: string) => href.startsWith("#");

  return (
    <section className="relative isolate flex min-h-screen w-full flex-col overflow-hidden">
      {/* Background image */}
      <Image
        src={backgroundImageUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Layered overlays for depth + legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(196, 162, 101, 0.18) 0%, transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      {/* Main content — centered in viewport */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pt-16 pb-12 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          {badgeText && (
            <div className="animate-fade-slide-in-1 mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur">
              {badgeLabel && (
                <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-primary/95 px-2 py-0.5 text-xs font-semibold tracking-wide text-dark">
                  {badgeLabel}
                </span>
              )}
              <span className="text-sm font-medium text-white/90">
                {badgeText}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="animate-fade-slide-in-2 font-serif text-4xl font-normal leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
            {titleLine2 && (
              <>
                <br />
                <span className="bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
                  {titleLine2}
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="animate-fade-slide-in-3 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {description}
          </p>

          {/* CTAs */}
          <div className="animate-fade-slide-in-4 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={primaryButtonHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-dark shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-primary/40"
            >
              {primaryButtonText}
              <ArrowRight />
            </Link>
            {secondaryButtonText && secondaryButtonHref && (
              isInternalHref(secondaryButtonHref) ? (
                <a
                  href={secondaryButtonHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10 hover:text-white"
                >
                  {secondaryButtonText}
                  <PlayIcon />
                </a>
              ) : (
                <Link
                  href={secondaryButtonHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10 hover:text-white"
                >
                  {secondaryButtonText}
                  <PlayIcon />
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Trust badges strip — pinned to bottom */}
      {trustBadges && trustBadges.length > 0 && (
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12 sm:pb-16">
          {trustTitle && (
            <p className="animate-fade-slide-in-1 text-center text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              {trustTitle}
            </p>
          )}
          <div className="animate-fade-slide-in-2 mt-5 grid grid-cols-2 items-center justify-items-center gap-3 sm:grid-cols-4 sm:gap-4">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold tracking-wide text-white/90 backdrop-blur-sm transition-colors duration-300 hover:border-primary/40 hover:bg-white/10 hover:text-white sm:w-auto sm:min-w-[140px]"
              >
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
