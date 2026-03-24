"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How does the charitable giving program work?",
    answer:
      "Every transaction processed through Generosity Pays automatically supports charitable causes. A portion of each transaction is directed to vetted charitable organizations — at no additional cost to your business. You process payments as usual, and the giving happens behind the scenes.",
  },
  {
    question: "Do I need to switch processors?",
    answer:
      "Not necessarily. We work with your existing setup when possible, or we can provide a seamless transition to our optimized processing platform. Either way, there's zero downtime for your business.",
  },
  {
    question: "Is the analysis really free?",
    answer:
      "Absolutely. Our analysis is 100% free with no obligation. We'll review your current processing statement so you can gain full clarity on your setup. If we identify savings opportunities, we'll share those too — all at no cost.",
  },
  {
    question: "How long does the process take?",
    answer:
      "The initial analysis takes 24-48 hours. If you decide to switch, the transition typically takes 3-5 business days. You can continue processing payments normally throughout the entire process.",
  },
  {
    question: "What makes Generosity Pays different from other processors?",
    answer:
      "We combine premium payment processing with a built-in charitable giving program. Every transaction supports real causes at no additional cost to you. Plus, you get transparent pricing, dedicated support, and ongoing statement reviews — the kind of service most processors don't offer.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className={`rounded-xl bg-white shadow-sm transition-shadow duration-300 ${
        !isOpen ? "hover:shadow-md" : "shadow-md"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="pr-4 text-lg font-semibold text-gray-900">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <HiChevronDown className="h-5 w-5 text-primary" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <p className="leading-relaxed text-gray-600">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section id="faq" ref={sectionRef} className="bg-warm py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Everything you need to know about Generosity Pays
          </p>
        </motion.div>

        {/* Accordion items */}
        <div className="flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openItems.has(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
