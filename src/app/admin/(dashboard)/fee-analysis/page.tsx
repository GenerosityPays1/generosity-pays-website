"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiArrowDownTray,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiCheck,
  HiXMark,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";

interface FeeAnalysisLead {
  id: number;
  created_at: string;
  business_name: string;
  contact_name: string;
  email: string;
  monthly_volume: number;
  statement_file: string | null;
  estimated_savings: number | null;
  status: string;
  [key: string]: unknown;
}

interface LeadsResponse {
  leads: FeeAnalysisLead[];
  total: number;
  page: number;
  totalPages: number;
}

export default function FeeAnalysisPage() {
  const { token } = useAdminAuth();
  const router = useRouter();

  const [leads, setLeads] = useState<FeeAnalysisLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "fee_analysis",
        page: String(page),
        limit: "20",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data: LeadsResponse = await res.json();
      setLeads(data.leads);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching fee analysis leads:", err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDownloadStatement = async (leadId: number, filename: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "statement";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleSaveSavings = async (leadId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimated_savings: parseFloat(editValue) || 0,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      fetchLeads();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const columns: Column<FeeAnalysisLead>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "business_name",
      label: "Business Name",
      render: (item) => (
        <span className="font-medium text-gray-900">
          {item.business_name}
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
        <a
          href={`mailto:${item.email}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {item.email}
        </a>
      ),
    },
    {
      key: "monthly_volume",
      label: "Monthly Volume",
      render: (item) => (
        <span className="font-medium">
          {item.monthly_volume
            ? `$${item.monthly_volume.toLocaleString()}`
            : "-"}
        </span>
      ),
    },
    {
      key: "statement_file",
      label: "Statement",
      render: (item) =>
        item.statement_file ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadStatement(item.id, item.statement_file!);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <HiArrowDownTray className="w-3.5 h-3.5" />
            Download
          </button>
        ) : (
          <span className="text-gray-400 text-xs">No file</span>
        ),
    },
    {
      key: "estimated_savings",
      label: "Estimated Savings",
      render: (item) => {
        if (editingId === item.id) {
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSavings(item.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
              <button
                onClick={() => handleSaveSavings(item.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <HiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-gray-400 hover:bg-gray-50 rounded"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(item.id);
              setEditValue(String(item.estimated_savings || ""));
            }}
            className="text-sm hover:text-primary transition-colors"
          >
            {item.estimated_savings
              ? `$${item.estimated_savings.toLocaleString()}`
              : "Click to set"}
          </button>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item) => <StatusBadge status={item.status} type="lead" />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/leads/${item.id}`);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <HiOutlineEye className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage fee analysis leads and statements
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && leads.length === 0 ? (
          <EmptyState
            icon={<HiOutlineDocumentText className="w-8 h-8" />}
            title="No fee analysis leads"
            description="Fee analysis submissions will appear here."
          />
        ) : (
          <>
            <DataTable columns={columns} data={leads} loading={loading} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
