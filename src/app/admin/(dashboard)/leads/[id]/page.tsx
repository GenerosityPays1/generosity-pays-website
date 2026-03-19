"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiEnvelope,
  HiPhone,
  HiBanknotes,
  HiTag,
  HiCalendarDays,
  HiArrowPath,
  HiDocumentArrowDown,
  HiArrowRightCircle,
  HiCheckCircle,
  HiClock,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import StatusBadge from "@/components/admin/StatusBadge";

interface LeadDetail {
  id: number;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  monthly_volume: string;
  lead_type: string;
  status: string;
  notes: string;
  statement_filename: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "not_interested", label: "Not Interested" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAdminAuth();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertedMerchantId, setConvertedMerchantId] = useState<number | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setNotFound(false);

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        setNotFound(true);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch lead");

      const data: LeadDetail = await res.json();
      setLead(data);
      setNotes(data.notes || "");
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !lead) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setLead((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch {
      alert("Failed to update lead status. Please try again.");
    }
  };

  const handleSaveNotes = async () => {
    if (!token || !lead) return;
    setSavingNotes(true);
    setNotesSaved(false);

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) throw new Error("Failed to save notes");

      setLead((prev) => (prev ? { ...prev, notes } : prev));
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {
      alert("Failed to save notes. Please try again.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDownloadStatement = async () => {
    if (!token || !lead) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to download statement");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = lead.statement_filename || "statement";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Failed to download statement. Please try again.");
    }
  };

  const handleConvertToMerchant = async () => {
    if (!token || !lead) return;
    setConverting(true);
    setConvertError(null);

    try {
      const res = await fetch(`/api/admin/leads/${id}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to convert lead");
      }

      const data = await res.json();
      setConvertedMerchantId(data.merchantId || data.merchant_id || data.id);
    } catch (err) {
      setConvertError(
        err instanceof Error ? err.message : "Failed to convert lead"
      );
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-72 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-40">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The lead you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/admin/leads")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => router.push("/admin/leads")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500 mt-0.5">{lead.business_name}</p>
          <div className="mt-2">
            <StatusBadge status={lead.status} type="lead" />
          </div>
        </div>

        {/* Status Change Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Status:</label>
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Info Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HiEnvelope className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">
                      {lead.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiPhone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</p>
                  <p className="text-sm text-gray-900 mt-0.5">{lead.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiBanknotes className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Monthly Volume</p>
                  <p className="text-sm text-gray-900 mt-0.5">{lead.monthly_volume || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiTag className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Lead Type</p>
                  <div className="mt-0.5">
                    <StatusBadge status={lead.lead_type} type="lead" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiCalendarDays className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Created</p>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDateTime(lead.created_at)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiArrowPath className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Updated</p>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDateTime(lead.updated_at)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notes Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesSaved(false);
              }}
              rows={5}
              placeholder="Add notes about this lead..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
            />
            <div className="flex items-center justify-between mt-3">
              <div>
                {notesSaved && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <HiCheckCircle className="w-4 h-4" />
                    Notes saved successfully
                  </span>
                )}
              </div>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </motion.div>

          {/* Statement Section */}
          {lead.statement_filename && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statement</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <HiDocumentArrowDown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.statement_filename}</p>
                    <p className="text-xs text-gray-500">Uploaded statement file</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadStatement}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <HiDocumentArrowDown className="w-4 h-4" />
                  Download
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Convert to Merchant Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Convert to Merchant</h2>
            <p className="text-sm text-gray-500 mb-4">
              Convert this lead into an active merchant account.
            </p>

            {convertedMerchantId ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Successfully converted!
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/admin/merchants/${convertedMerchantId}`)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
                >
                  View Merchant
                  <HiArrowRightCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {convertError && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-3">
                    <p className="text-sm text-red-700">{convertError}</p>
                  </div>
                )}
                <button
                  onClick={handleConvertToMerchant}
                  disabled={converting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {converting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Converting...
                    </>
                  ) : (
                    <>
                      <HiArrowRightCircle className="w-4 h-4" />
                      Convert to Merchant
                    </>
                  )}
                </button>
              </>
            )}
          </motion.div>

          {/* Lead Meta Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiCalendarDays className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{formatDate(lead.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiClock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(lead.updated_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiTag className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Lead Type</p>
                  <div className="mt-0.5">
                    <StatusBadge status={lead.lead_type} type="lead" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HiArrowPath className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Current Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={lead.status} type="lead" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
