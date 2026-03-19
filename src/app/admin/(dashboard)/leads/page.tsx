"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiPlus,
  HiArrowDownTray,
  HiMagnifyingGlass,
  HiEye,
  HiTrash,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

interface Lead {
  id: number;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  monthly_volume: string;
  lead_type: string;
  status: string;
  created_at: string;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "not_interested", label: "Not Interested" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "fee_analysis", label: "Fee Analysis" },
  { value: "consultation", label: "Consultation" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default function LeadsPage() {
  const { token } = useAdminAuth();
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        type: typeFilter,
        search: debouncedSearch,
      });

      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch leads");

      const data: LeadsResponse = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch {
      alert("Failed to update lead status. Please try again.");
    }
  };

  const handleDelete = async (leadId: number) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete lead");

      setDeleteConfirmId(null);
      fetchLeads();
    } catch {
      alert("Failed to delete lead. Please try again.");
    }
  };

  const handleExportCSV = async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/admin/leads/export", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to export leads");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Failed to export leads. Please try again.");
    }
  };

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const leadData = {
      name: formData.get("name") as string,
      business_name: formData.get("business_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      monthly_volume: formData.get("monthly_volume") as string,
      lead_type: formData.get("lead_type") as string,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });

      if (!res.ok) throw new Error("Failed to create lead");

      setShowAddModal(false);
      setPage(1);
      fetchLeads();
    } catch {
      alert("Failed to create lead. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (row) => {
        const lead = row as unknown as Lead;
        return (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(lead.created_at)}
          </span>
        );
      },
    },
    {
      key: "name",
      label: "Name",
      render: (row) => {
        const lead = row as unknown as Lead;
        return <span className="font-medium text-gray-900">{lead.name}</span>;
      },
    },
    {
      key: "business_name",
      label: "Business",
      render: (row) => {
        const lead = row as unknown as Lead;
        return <span className="text-gray-600">{lead.business_name}</span>;
      },
    },
    {
      key: "email",
      label: "Email",
      render: (row) => {
        const lead = row as unknown as Lead;
        return <span className="text-gray-600 text-xs">{lead.email}</span>;
      },
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => {
        const lead = row as unknown as Lead;
        return <span className="text-gray-600 text-xs">{lead.phone || "\u2014"}</span>;
      },
    },
    {
      key: "monthly_volume",
      label: "Volume",
      render: (row) => {
        const lead = row as unknown as Lead;
        return <span className="text-gray-600 text-xs">{lead.monthly_volume || "\u2014"}</span>;
      },
    },
    {
      key: "lead_type",
      label: "Type",
      render: (row) => {
        const lead = row as unknown as Lead;
        return <StatusBadge status={lead.lead_type} type="lead" />;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const lead = row as unknown as Lead;
        return (
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {STATUS_OPTIONS.filter((opt) => opt.value !== "all").map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const lead = row as unknown as Lead;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/leads/${lead.id}`);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
              title="View Lead"
            >
              <HiEye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmId(lead.id);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Lead"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <HiArrowDownTray className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Data Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        {!loading && leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your filters or add a new lead to get started."
            action={{ label: "Add Lead", onClick: () => setShowAddModal(true) }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={leads as unknown as Record<string, unknown>[]}

            loading={loading}
          />
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
          />
        </motion.div>
      )}

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead"
        size="lg"
      >
        <form onSubmit={handleAddLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                name="business_name"
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Volume
              </label>
              <input
                name="monthly_volume"
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="$50,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Type <span className="text-red-500">*</span>
              </label>
              <select
                name="lead_type"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="fee_analysis">Fee Analysis</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Lead"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Lead"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
