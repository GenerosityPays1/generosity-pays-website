"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiPencil,
  HiCheck,
  HiXMark,
  HiCheckCircle,
  HiLink,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import StatusBadge from "@/components/admin/StatusBadge";

interface Merchant {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  monthly_volume: number | null;
  current_processor: string | null;
  current_rate: number | null;
  our_rate: number | null;
  estimated_savings: number | null;
  pipeline_stage: string;
  notes: string | null;
  lead_id: number | null;
  created_at: string;
  updated_at: string;
}

const STAGES = [
  { key: "new_lead", label: "New Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "fee_analysis_sent", label: "Fee Analysis Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "application_submitted", label: "Application Submitted" },
  { key: "approved", label: "Approved" },
  { key: "installed", label: "Installed" },
  { key: "active_merchant", label: "Active Merchant" },
] as const;

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const router = useRouter();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [changingStage, setChangingStage] = useState(false);
  const [notes, setNotes] = useState("");

  // Edit form states
  const [contactForm, setContactForm] = useState({
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [financialForm, setFinancialForm] = useState({
    monthly_volume: "",
    current_processor: "",
    current_rate: "",
    our_rate: "",
    estimated_savings: "",
  });

  const fetchMerchant = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const m = data.merchant as Merchant;
        setMerchant(m);
        setNotes(m.notes || "");
        setContactForm({
          contact_name: m.contact_name || "",
          email: m.email || "",
          phone: m.phone || "",
          address: m.address || "",
        });
        setFinancialForm({
          monthly_volume: m.monthly_volume ? String(m.monthly_volume) : "",
          current_processor: m.current_processor || "",
          current_rate: m.current_rate ? String(m.current_rate) : "",
          our_rate: m.our_rate ? String(m.our_rate) : "",
          estimated_savings: m.estimated_savings
            ? String(m.estimated_savings)
            : "",
        });
      } else {
        router.push("/admin/merchants");
      }
    } catch (error) {
      console.error("Failed to fetch merchant:", error);
      router.push("/admin/merchants");
    } finally {
      setLoading(false);
    }
  }, [token, id, router]);

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  const handleStageChange = async (newStage: string) => {
    if (!token || !id) return;
    setChangingStage(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}/stage`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        await fetchMerchant();
      }
    } catch (error) {
      console.error("Failed to update stage:", error);
    } finally {
      setChangingStage(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!token || !id) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        await fetchMerchant();
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveContact = async () => {
    if (!token || !id) return;
    setSavingContact(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_name: contactForm.contact_name,
          email: contactForm.email,
          phone: contactForm.phone || null,
          address: contactForm.address || null,
        }),
      });
      if (res.ok) {
        await fetchMerchant();
        setEditingContact(false);
      }
    } catch (error) {
      console.error("Failed to save contact info:", error);
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveFinancial = async () => {
    if (!token || !id) return;
    setSavingFinancial(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthly_volume: financialForm.monthly_volume
            ? Number(financialForm.monthly_volume)
            : null,
          current_processor: financialForm.current_processor || null,
          current_rate: financialForm.current_rate
            ? Number(financialForm.current_rate)
            : null,
          our_rate: financialForm.our_rate
            ? Number(financialForm.our_rate)
            : null,
          estimated_savings: financialForm.estimated_savings
            ? Number(financialForm.estimated_savings)
            : null,
        }),
      });
      if (res.ok) {
        await fetchMerchant();
        setEditingFinancial(false);
      }
    } catch (error) {
      console.error("Failed to save financial info:", error);
    } finally {
      setSavingFinancial(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatRate = (value: number | null) => {
    if (value === null || value === undefined) return "--";
    return `${value}%`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-72 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl h-48 animate-pulse" />
            <div className="bg-white rounded-xl h-48 animate-pulse" />
          </div>
          <div className="bg-white rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!merchant) return null;

  const currentStageIndex = STAGES.findIndex(
    (s) => s.key === merchant.pipeline_stage
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/merchants")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Merchants
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">
            {merchant.business_name}
          </h1>
          <StatusBadge status={merchant.pipeline_stage} type="pipeline" />
        </div>

        {/* Stage Change Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-500">
            Move to:
          </label>
          <select
            value={merchant.pipeline_stage}
            onChange={(e) => handleStageChange(e.target.value)}
            disabled={changingStage}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white disabled:opacity-50"
          >
            {STAGES.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Contact Information
              </h2>
              {editingContact ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingContact(false);
                      setContactForm({
                        contact_name: merchant.contact_name || "",
                        email: merchant.email || "",
                        phone: merchant.phone || "",
                        address: merchant.address || "",
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <HiXMark className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={savingContact}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <HiCheck className="w-3.5 h-3.5" />
                    {savingContact ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingContact(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            <div className="px-6 py-4">
              {editingContact ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.contact_name}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          contact_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={contactForm.address}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Contact Name
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {merchant.contact_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Email
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {merchant.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Phone
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {merchant.phone || "--"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Address
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {merchant.address || "--"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </motion.div>

          {/* Financial Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Financial Information
              </h2>
              {editingFinancial ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingFinancial(false);
                      setFinancialForm({
                        monthly_volume: merchant.monthly_volume
                          ? String(merchant.monthly_volume)
                          : "",
                        current_processor: merchant.current_processor || "",
                        current_rate: merchant.current_rate
                          ? String(merchant.current_rate)
                          : "",
                        our_rate: merchant.our_rate
                          ? String(merchant.our_rate)
                          : "",
                        estimated_savings: merchant.estimated_savings
                          ? String(merchant.estimated_savings)
                          : "",
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <HiXMark className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFinancial}
                    disabled={savingFinancial}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <HiCheck className="w-3.5 h-3.5" />
                    {savingFinancial ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingFinancial(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            <div className="px-6 py-4">
              {editingFinancial ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Monthly Volume ($)
                    </label>
                    <input
                      type="number"
                      value={financialForm.monthly_volume}
                      onChange={(e) =>
                        setFinancialForm({
                          ...financialForm,
                          monthly_volume: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Current Processor
                    </label>
                    <input
                      type="text"
                      value={financialForm.current_processor}
                      onChange={(e) =>
                        setFinancialForm({
                          ...financialForm,
                          current_processor: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Current Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={financialForm.current_rate}
                      onChange={(e) =>
                        setFinancialForm({
                          ...financialForm,
                          current_rate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Our Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={financialForm.our_rate}
                      onChange={(e) =>
                        setFinancialForm({
                          ...financialForm,
                          our_rate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Estimated Savings ($)
                    </label>
                    <input
                      type="number"
                      value={financialForm.estimated_savings}
                      onChange={(e) =>
                        setFinancialForm({
                          ...financialForm,
                          estimated_savings: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Monthly Volume
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {formatCurrency(merchant.monthly_volume)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Current Processor
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {merchant.current_processor || "--"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Current Rate
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {formatRate(merchant.current_rate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Our Rate
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5">
                      {formatRate(merchant.our_rate)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Estimated Savings
                    </dt>
                    <dd className="text-sm font-semibold text-green-600 mt-0.5">
                      {formatCurrency(merchant.estimated_savings)}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </motion.div>

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Notes</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this merchant..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes || notes === (merchant.notes || "")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiCheck className="w-4 h-4" />
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stage Progression */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Pipeline Progress
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-1">
                {STAGES.map((stage, idx) => {
                  const isPast = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const isFuture = idx > currentStageIndex;

                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      {/* Connector Line + Icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${
                            isPast
                              ? "bg-green-100 text-green-600"
                              : isCurrent
                              ? "bg-primary text-white ring-2 ring-primary/20"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isPast ? (
                            <HiCheckCircle className="w-5 h-5" />
                          ) : isCurrent ? (
                            <span className="w-2.5 h-2.5 bg-white rounded-full" />
                          ) : (
                            <span className="w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        {idx < STAGES.length - 1 && (
                          <div
                            className={`w-0.5 h-4 ${
                              isPast ? "bg-green-200" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      {/* Label */}
                      <span
                        className={`text-sm leading-7 ${
                          isPast
                            ? "text-green-700 font-medium"
                            : isCurrent
                            ? "text-gray-900 font-semibold"
                            : isFuture
                            ? "text-gray-400"
                            : ""
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Details
              </h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Created
                </dt>
                <dd className="text-sm text-gray-900 mt-0.5">
                  {formatDate(merchant.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="text-sm text-gray-900 mt-0.5">
                  {formatDate(merchant.updated_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Merchant ID
                </dt>
                <dd className="text-sm text-gray-900 mt-0.5 font-mono">
                  #{merchant.id}
                </dd>
              </div>
              {merchant.lead_id && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Linked Lead
                  </dt>
                  <dd className="mt-0.5">
                    <button
                      onClick={() =>
                        router.push(`/admin/leads/${merchant.lead_id}`)
                      }
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <HiLink className="w-3.5 h-3.5" />
                      Lead #{merchant.lead_id}
                    </button>
                  </dd>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
