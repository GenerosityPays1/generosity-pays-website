"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineServerStack,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/admin/EmptyState";

type LogType = "server" | "login" | "activity";

interface ServerLog {
  id: number;
  level: string;
  category: string;
  message: string;
  details: string | null;
  ip_address: string | null;
  request_path: string | null;
  created_at: string;
  [key: string]: unknown;
}

interface LoginAttempt {
  id: number;
  ip_address: string;
  username: string;
  success: number;
  created_at: string;
  [key: string]: unknown;
}

interface ActivityLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  admin_user_id: number | null;
  created_at: string;
  [key: string]: unknown;
}

interface LogsResponse {
  logs: (ServerLog | LoginAttempt | ActivityLog)[];
  total: number;
  page: number;
  totalPages: number;
}

const tabs: { key: LogType; label: string; icon: React.ReactNode }[] = [
  {
    key: "server",
    label: "Server Logs",
    icon: <HiOutlineServerStack className="w-4 h-4" />,
  },
  {
    key: "login",
    label: "Login Attempts",
    icon: <HiOutlineShieldCheck className="w-4 h-4" />,
  },
  {
    key: "activity",
    label: "Activity Log",
    icon: <HiOutlineClipboardDocumentList className="w-4 h-4" />,
  },
];

const levelColors: Record<string, string> = {
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  critical: "bg-red-100 text-red-900 font-bold",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LogsPage() {
  const { token } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<LogType>("server");
  const [logs, setLogs] = useState<(ServerLog | LoginAttempt | ActivityLog)[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [levelFilter, setLevelFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        log_type: activeTab,
        page: String(page),
        limit: "30",
      });
      if (levelFilter) params.set("level", levelFilter);
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data: LogsResponse = await res.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, page, levelFilter, categoryFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page when tab or filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, levelFilter, categoryFilter]);

  const serverColumns: Column<ServerLog>[] = [
    {
      key: "created_at",
      label: "Time",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap text-xs">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (item) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
            levelColors[item.level] || "bg-gray-100 text-gray-700"
          }`}
        >
          {item.level.toUpperCase()}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (item) => (
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {item.category}
        </span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (item) => (
        <span className="text-sm text-gray-800">{item.message}</span>
      ),
    },
    {
      key: "ip_address",
      label: "IP",
      render: (item) => (
        <span className="text-xs text-gray-500 font-mono">
          {item.ip_address || "-"}
        </span>
      ),
    },
    {
      key: "request_path",
      label: "Path",
      render: (item) => (
        <span className="text-xs text-gray-500 font-mono">
          {item.request_path || "-"}
        </span>
      ),
    },
  ];

  const loginColumns: Column<LoginAttempt>[] = [
    {
      key: "created_at",
      label: "Time",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap text-xs">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      key: "username",
      label: "Username",
      render: (item) => (
        <span className="text-sm font-medium text-gray-800">
          {item.username}
        </span>
      ),
    },
    {
      key: "ip_address",
      label: "IP Address",
      render: (item) => (
        <span className="text-xs text-gray-500 font-mono">
          {item.ip_address}
        </span>
      ),
    },
    {
      key: "success",
      label: "Result",
      render: (item) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
            item.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {item.success ? "Success" : "Failed"}
        </span>
      ),
    },
  ];

  const activityColumns: Column<ActivityLog>[] = [
    {
      key: "created_at",
      label: "Time",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap text-xs">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (item) => (
        <span className="text-sm font-medium text-gray-800">{item.action}</span>
      ),
    },
    {
      key: "entity_type",
      label: "Entity",
      render: (item) => (
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {item.entity_type}
          {item.entity_id ? ` #${item.entity_id}` : ""}
        </span>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.details
            ? item.details.length > 80
              ? item.details.slice(0, 80) + "..."
              : item.details
            : "-"}
        </span>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor server events, login attempts, and admin activity
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters (server logs only) */}
      {activeTab === "server" && (
        <div className="flex items-center gap-3 mb-4">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="">All Categories</option>
            <option value="auth">Auth</option>
            <option value="form_submission">Form Submission</option>
            <option value="server">Server</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && logs.length === 0 ? (
          <EmptyState
            icon={<HiOutlineServerStack className="w-8 h-8" />}
            title="No logs found"
            description="Logs will appear here as events occur."
          />
        ) : (
          <>
            {activeTab === "server" && (
              <DataTable
                columns={serverColumns}
                data={logs as ServerLog[]}
                loading={loading}
              />
            )}
            {activeTab === "login" && (
              <DataTable
                columns={loginColumns}
                data={logs as LoginAttempt[]}
                loading={loading}
              />
            )}
            {activeTab === "activity" && (
              <DataTable
                columns={activityColumns}
                data={logs as ActivityLog[]}
                loading={loading}
              />
            )}
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
