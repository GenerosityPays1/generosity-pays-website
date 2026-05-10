"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCalculator,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
  HiOutlineFunnel,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";

interface CalculatorLead {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  monthly_volume: number;
  current_rate: number;
  current_monthly_fees: number;
  estimated_monthly_savings: number;
  estimated_annual_savings: number;
  charity_impact: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

export default function CalculatorLeadsPage() {
  const { token } = useAdminAuth();
  const [leads, setLeads] = useState<CalculatorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/calculator-leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLeads(data.leads);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching calculator leads:", err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/calculator-leads/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      fetchLeads();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleExport = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/calculator-leads/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calculator-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const columns: Column<CalculatorLead>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap text-sm">
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
      label: "Business",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.business_name}</p>
          <p className="text-xs text-gray-500">{item.contact_name}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (item) => (
        <a
          href={`mailto:${item.email}`}
          className="text-primary text-sm hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {item.email}
        </a>
      ),
    },
    {
      key: "monthly_volume",
      label: "Volume/mo",
      render: (item) => (
        <span className="font-medium text-sm">{fmt(item.monthly_volume)}</span>
      ),
    },
    {
      key: "current_rate",
      label: "Rate",
      render: (item) => (
        <span className="text-sm">{item.current_rate}%</span>
      ),
    },
    {
      key: "estimated_monthly_savings",
      label: "Savings/mo",
      render: (item) => (
        <span className="font-semibold text-emerald-600 text-sm">
          {fmt(item.estimated_monthly_savings)}
        </span>
      ),
    },
    {
      key: "estimated_annual_savings",
      label: "Savings/yr",
      render: (item) => (
        <span className="font-bold text-emerald-700 text-sm">
          {fmt(item.estimated_annual_savings)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) => {
            e.stopPropagation();
            handleStatusChange(item.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        >
          {STATUS_OPTIONS.filter((o) => o.value !== "").map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Calculator Leads
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submissions from the Savings Calculator tool
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="relative">
            <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-48 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <HiOutlineArrowDownTray className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && leads.length === 0 ? (
          <EmptyState
            icon={<HiOutlineCalculator className="w-8 h-8" />}
            title="No calculator leads yet"
            description="Leads from the savings calculator will appear here."
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
