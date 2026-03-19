"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: number | string;
  type: "lead" | "merchant" | "contact";
  name: string;
  subtitle?: string;
}

interface GroupedResults {
  Leads: SearchResult[];
  Merchants: SearchResult[];
  Contacts: SearchResult[];
}

const typeRoutes: Record<string, string> = {
  lead: "/admin/leads",
  merchant: "/admin/merchants",
  contact: "/admin/contacts",
};

const typeLabels: Record<string, keyof GroupedResults> = {
  lead: "Leads",
  merchant: "Merchants",
  contact: "Contacts",
};

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const router = useRouter();
  const { token } = useAdminAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  const doSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !token) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch {
        // Silently fail on network errors
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doSearch]);

  // Group results by type
  const grouped: GroupedResults = {
    Leads: results.filter((r) => r.type === "lead"),
    Merchants: results.filter((r) => r.type === "merchant"),
    Contacts: results.filter((r) => r.type === "contact"),
  };

  // Flat list for keyboard navigation
  const flatResults = [
    ...grouped.Leads,
    ...grouped.Merchants,
    ...grouped.Contacts,
  ];

  const handleSelect = (result: SearchResult) => {
    const route = typeRoutes[result.type];
    if (route) {
      router.push(`${route}/${result.id}`);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < flatResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : flatResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    }
  };

  // Render a group
  const renderGroup = (label: string, items: SearchResult[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </div>
        {items.map((result) => {
          const globalIdx = flatResults.indexOf(result);
          const isSelected = globalIdx === selectedIndex;
          return (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(globalIdx)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                isSelected ? "bg-primary/10 text-gray-900" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{result.name}</p>
                {result.subtitle && (
                  <p className="text-xs text-gray-400 truncate">
                    {result.subtitle}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {typeLabels[result.type]}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Command palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-100">
              <HiMagnifyingGlass className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, merchants, contacts..."
                className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="px-4 py-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!loading && query && flatResults.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {!loading && flatResults.length > 0 && (
                <div className="py-2">
                  {renderGroup("Leads", grouped.Leads)}
                  {renderGroup("Merchants", grouped.Merchants)}
                  {renderGroup("Contacts", grouped.Contacts)}
                </div>
              )}

              {!loading && !query && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Start typing to search...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded border border-gray-200 font-medium">
                  &uarr;
                </kbd>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded border border-gray-200 font-medium">
                  &darr;
                </kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded border border-gray-200 font-medium">
                  &crarr;
                </kbd>
                to select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
