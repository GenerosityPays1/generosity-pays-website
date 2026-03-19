"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HiUsers,
  HiSparkles,
  HiBuildingStorefront,
  HiArrowTrendingUp,
  HiCalendarDays,
  HiUserGroup,
  HiArrowRight,
  HiClock,
  HiBolt,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import StatsCard from "@/components/admin/StatsCard";
import BarChart from "@/components/admin/BarChart";
import DataTable, { type Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface RecentLead {
  id: number;
  name: string;
  business_name: string;
  email: string;
  lead_type: string;
  status: string;
  created_at: string;
}

interface ActivityEntry {
  id: number;
  action: string;
  entity_type: string;
  details: string;
  created_at: string;
}

interface DashboardStats {
  totalLeads: number;
  newLeadsThisWeek: number;
  totalMerchants: number;
  activeMerchants: number;
  upcomingAppointments: number;
  leadsPerWeek: { week: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  pipelineByStage: { stage: string; count: number }[];
  recentLeads: RecentLead[];
  recentActivity: ActivityEntry[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard stats");

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const recentLeadColumns: Column<Record<string, unknown>>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (row) => {
        const lead = row as unknown as RecentLead;
        return <span className="text-gray-500 text-xs">{formatDate(lead.created_at)}</span>;
      },
    },
    {
      key: "name",
      label: "Name",
      render: (row) => {
        const lead = row as unknown as RecentLead;
        return <span className="font-medium text-gray-900">{lead.name}</span>;
      },
    },
    {
      key: "business_name",
      label: "Business",
      render: (row) => {
        const lead = row as unknown as RecentLead;
        return <span className="text-gray-600">{lead.business_name}</span>;
      },
    },
    {
      key: "lead_type",
      label: "Type",
      render: (row) => {
        const lead = row as unknown as RecentLead;
        return <StatusBadge status={lead.lead_type} type="lead" />;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const lead = row as unknown as RecentLead;
        return <StatusBadge status={lead.status} type="lead" />;
      },
    },
  ];

  const conversionRate =
    stats && stats.totalLeads > 0
      ? ((stats.activeMerchants / stats.totalLeads) * 100).toFixed(1) + "%"
      : "0%";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-72">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Error loading dashboard</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.h1
        variants={itemVariants}
        className="text-2xl font-bold text-gray-900"
      >
        Dashboard Overview
      </motion.h1>

      {/* Stats Cards Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<HiUsers className="w-6 h-6" />}
        />
        <StatsCard
          title="New This Week"
          value={stats.newLeadsThisWeek}
          icon={<HiSparkles className="w-6 h-6" />}
        />
        <StatsCard
          title="Active Merchants"
          value={stats.activeMerchants}
          icon={<HiBuildingStorefront className="w-6 h-6" />}
        />
        <StatsCard
          title="Conversion Rate"
          value={conversionRate}
          icon={<HiArrowTrendingUp className="w-6 h-6" />}
        />
        <StatsCard
          title="Upcoming Appts"
          value={stats.upcomingAppointments}
          icon={<HiCalendarDays className="w-6 h-6" />}
        />
        <StatsCard
          title="Total Merchants"
          value={stats.totalMerchants}
          icon={<HiUserGroup className="w-6 h-6" />}
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Leads Per Week Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads Per Week</h2>
          <BarChart
            data={stats.leadsPerWeek.map((item) => ({
              label: item.week,
              value: item.count,
            }))}
            height={240}
            barColor="#2563eb"
          />
        </div>

        {/* Pipeline Overview Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h2>
          <BarChart
            data={stats.pipelineByStage.map((item) => ({
              label: item.stage,
              value: item.count,
            }))}
            height={240}
            barColor="#7c3aed"
          />
        </div>
      </motion.div>

      {/* Recent Leads Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View All
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <DataTable
          columns={recentLeadColumns}
          data={stats.recentLeads.slice(0, 5) as unknown as Record<string, unknown>[]}
          loading={false}
        />
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentActivity.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No recent activity
            </div>
          ) : (
            stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="mt-0.5 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.entity_type === "lead" ? (
                    <HiUsers className="w-4 h-4 text-primary" />
                  ) : activity.entity_type === "appointment" ? (
                    <HiCalendarDays className="w-4 h-4 text-primary" />
                  ) : (
                    <HiBolt className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  {activity.details && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.details}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <HiClock className="w-3.5 h-3.5" />
                  <span>{formatTimeAgo(activity.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
