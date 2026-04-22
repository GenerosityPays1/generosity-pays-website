"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HiHeart, HiSparkles, HiHandRaised } from "react-icons/hi2";
import { IconType } from "react-icons";

interface Cause {
  name: string;
  description: string;
}

const causes: Cause[] = [
  {
    name: "Youth Empowerment",
    description:
      "Programs that mentor, educate, and open doors for the next generation.",
  },
  {
    name: "American Cancer Society",
    description:
      "Funding research, patient support, and prevention in the fight against cancer.",
  },
  {
    name: "Special Olympics",
    description:
      "Celebrating the strength, courage, and joy of athletes with intellectual disabilities.",
  },
  {
    name: "Your Cause",
    description:
      "Already supporting a nonprofit close to your heart? We'll direct your give-back there instead.",
  },
];

interface Value {
  title: string;
  description: string;
  icon: IconType;
}

const values: Value[] = [
  {
    title: "Family Values",
    description:
      "We treat every client the way we'd want our own family's business treated — honestly, patiently, and for the long haul.",
    icon: HiHandRaised,
  },
  {
    title: "White-Glove Service",
    description:
      "No call centers, no chatbots as a first line. Real people who learn your business and pick up when you call.",
    icon: HiSparkles,
  },
  {
    title: "Purpose Built In",
    description:
      "Generosity isn't a marketing line — it's why we exist. Every swipe supports a cause that matters.",
    icon: HiHeart,
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-gray-50 py-24">
      {/* Soft warm accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(196, 162, 101, 0.08), transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(212, 184, 122, 0.08), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-sm font-medium tracking-[0.2em] uppercase text-primary">
            About Generosity Pays
          </p>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            A family business on a mission to give back
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Generosity Pays is a family-owned and operated merchant services
            company. We help businesses accept payments, build beautiful
            websites, and streamline online ordering — while directing a
            portion of every transaction to nonprofits that change lives.
          </p>
        </motion.div>

        {/* Story + image */}
        <div className="mb-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-80 w-full overflow-hidden rounded-2xl shadow-xl sm:h-96 lg:h-[28rem]"
          >
            <Image
              src="/images/features-business.jpg"
              alt="Local businesses thriving on a vibrant main street"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-dark/40 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h3 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
              Built on relationships, not transactions
            </h3>
            <div className="space-y-4 text-lg leading-relaxed text-gray-600">
              <p>
                We started Generosity Pays because we believe the merchant
                services industry had lost its way — hidden fees, anonymous
                support, and zero connection to the businesses and communities
                it serves.
              </p>
              <p>
                As a family-run company, we do it differently. We sit down with
                you, learn your business, and build a solution that fits — from
                payment processing to your website to how customers order
                online.
              </p>
              <p className="font-medium text-gray-800">
                And then we go one step further: a portion of every transaction
                goes to a cause that matters to you.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="rounded-2xl bg-white p-8 shadow-md transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <h4 className="mb-3 text-xl font-semibold text-gray-900">
                  {value.title}
                </h4>
                <p className="leading-relaxed text-gray-500">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Causes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl bg-dark p-10 shadow-2xl sm:p-14"
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium tracking-[0.2em] uppercase text-primary">
              Causes We Support
            </p>
            <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
              Every transaction, a little good
            </h3>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-300">
              By default, we direct give-back to three causes close to our
              family. Already supporting a nonprofit you love? We&apos;ll send
              your contribution there instead.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {causes.map((cause, index) => (
              <motion.div
                key={cause.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-primary/40 hover:bg-white/10"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <HiHeart className="h-5 w-5" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-white">
                  {cause.name}
                </h4>
                <p className="text-sm leading-relaxed text-gray-400">
                  {cause.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark"
              >
                Pick Your Cause, Start Giving
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
