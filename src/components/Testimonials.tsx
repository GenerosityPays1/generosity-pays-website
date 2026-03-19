"use client";

import { motion } from "framer-motion";
import { HiShieldCheck, HiLockClosed, HiPhone, HiSwitchHorizontal } from "react-icons/hi";
import { IconType } from "react-icons";

interface TrustBadge {
  label: string;
  icon: IconType;
}

const trustBadges: TrustBadge[] = [
  { label: "PCI Compliant", icon: HiShieldCheck },
  { label: "256-bit Encryption", icon: HiLockClosed },
  { label: "24/7 Support", icon: HiPhone },
  { label: "Easy Switching", icon: HiSwitchHorizontal },
];

export default function Testimonials() {
  return (
    <section id="trust" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 rounded-xl bg-warm px-4 py-6 text-center"
              >
                <Icon className="h-7 w-7 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
