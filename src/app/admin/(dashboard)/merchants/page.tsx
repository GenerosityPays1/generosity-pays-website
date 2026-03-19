"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiPlus,
  HiMagnifyingGlass,
  HiTrash,
  HiEye,
  HiBuildingStorefront,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

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

const INITIAL_FORM = {
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  monthly_volume: "",
  current_processor: "",
  current_rate: "",
  our_rate: "",
  notes: "",
};

export default function MerchantsPage() {
  const { token } = useAdminAuth();
  const router = useRouter();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMerchants = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        stage: stageFilter,
        search,
      });
      const res = await fetch(`/api/admin/merchants?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMerchants(data.merchants);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, stageFilter]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, stageFilter]);

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setFormError("");

    try {
      const body: Record<string, string | number | null> = {
        business_name: formData.business_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        monthly_volume: formData.monthly_volume
          ? Number(formData.monthly_volume)
          : null,
        current_processor: formData.current_processor || null,
        current_rate: formData.current_rate
          ? Number(formData.current_rate)
          : null,
        our_rate: formData.our_rate ? Number(formData.our_rate) : null,
        notes: formData.notes || null,
      };

      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to create merchant");
        return;
      }

      setShowAddModal(false);
      setFormData(INITIAL_FORM);
      fetchMerchants();
    } catch {
      setFormError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchMerchants();
      }
    } catch (error) {
      console.error("Failed to delete merchant:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatVolume = (volume: number | null) => {
    if (!volume) return "--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(volume);
  };

  const columns: Column<Merchant & Record<string, unknown>>[] = [
    {
      key: "business_name",
      label: "Business Name",
      render: (item) => (
        <span className="font-semibold text-gray-900">
          {item.business_name as string}
        </span>
      ),
    },
    {
      key: "contact_name",
      label: "Contact Name",
    },
    {
      key: "email",
      label: "Email",
      render: (item) => (
        <span className="text-gray-600">{item.email as string}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (item) => (
        <span className="text-gray-600">
          {(item.phone as string | null) || "--"}
        </span>
      ),
    },
    {
      key: "monthly_volume",
      label: "Monthly Volume",
      render: (item) => (
        <span className="text-gray-600">
          {formatVolume(item.monthly_volume as number | null)}
        </span>
      ),
    },
    {
      key: "pipeline_stage",
      label: "Stage",
      render: (item) => (
        <StatusBadge
          status={item.pipeline_stage as string}
          type="pipeline"
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/merchants/${item.id}`);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <HiEye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm(item.id as number);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <HiTrash className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Merchant Database
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all merchants and their pipeline stages
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Add Merchant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
          >
            <option value="all">All Stages</option>
            {STAGES.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && merchants.length === 0 ? (
          <EmptyState
            icon={<HiBuildingStorefront className="w-8 h-8" />}
            title="No merchants found"
            description={
              search || stageFilter !== "all"
                ? "Try adjusting your filters to find what you are looking for."
                : "Get started by adding your first merchant."
            }
            action={
              search || stageFilter !== "all"
                ? {
                    label: "Clear Filters",
                    onClick: () => {
                      setSearch("");
                      setStageFilter("all");
                    },
                  }
                : {
                    label: "Add Merchant",
                    onClick: () => setShowAddModal(true),
                  }
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={merchants as (Merchant & Record<string, unknown>)[]}
              loading={loading}
              onRowClick={(item) =>
                router.push(`/admin/merchants/${item.id}`)
              }
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
            />
          </>
        )}
      </div>

      {/* Add Merchant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData(INITIAL_FORM);
          setFormError("");
        }}
        title="Add Merchant"
        size="lg"
      >
        <form onSubmit={handleAddMerchant} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) =>
                  setFormData({ ...formData, contact_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Volume ($)
              </label>
              <input
                type="number"
                value={formData.monthly_volume}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_volume: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Processor
              </label>
              <input
                type="text"
                value={formData.current_processor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_processor: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.current_rate}
                onChange={(e) =>
                  setFormData({ ...formData, current_rate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Our Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.our_rate}
                onChange={(e) =>
                  setFormData({ ...formData, our_rate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setFormData(INITIAL_FORM);
                setFormError("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Merchant"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Merchant"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this merchant? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
