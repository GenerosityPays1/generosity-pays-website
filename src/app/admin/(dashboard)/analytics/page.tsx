"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import BarChart from "@/components/admin/BarChart";

interface AnalyticsData {
  leadsPerMonth: { label: string; value: number }[];
  merchantsPerMonth: { label: string; value: number }[];
  pipelineFunnel: { label: string; value: number }[];
  leadSourceBreakdown: {
    fee_analysis: number;
    consultation: number;
    total: number;
  };
}

export default function AnalyticsPage() {
  const { token } = useAdminAuth();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Performance metrics and insights
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-[200px] bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <HiOutlineChartBar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  const feeAnalysisPercentage =
    data.leadSourceBreakdown.total > 0
      ? Math.round(
          (data.leadSourceBreakdown.fee_analysis /
            data.leadSourceBreakdown.total) *
            100
        )
      : 0;
  const consultationPercentage =
    data.leadSourceBreakdown.total > 0
      ? Math.round(
          (data.leadSourceBreakdown.consultation /
            data.leadSourceBreakdown.total) *
            100
        )
      : 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Performance metrics and insights
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads Per Month */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Leads Per Month
          </h3>
          <BarChart
            data={data.leadsPerMonth}
            height={220}
            barColor="#2563eb"
          />
        </motion.div>

        {/* Merchants Per Month */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Merchants Per Month
          </h3>
          <BarChart
            data={data.merchantsPerMonth}
            height={220}
            barColor="#10b981"
          />
        </motion.div>

        {/* Pipeline Funnel */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Pipeline Funnel
          </h3>
          <BarChart
            data={data.pipelineFunnel}
            height={220}
            barColor="#8b5cf6"
          />
        </motion.div>

        {/* Lead Source Breakdown */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Lead Source Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4 h-[188px] items-center">
            {/* Fee Analysis Card */}
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {data.leadSourceBreakdown.fee_analysis}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Fee Analysis
              </p>
              <div className="mt-2 text-xs text-blue-500 font-semibold">
                {feeAnalysisPercentage}%
              </div>
            </div>

            {/* Consultation Card */}
            <div className="bg-emerald-50 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {data.leadSourceBreakdown.consultation}
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Consultation
              </p>
              <div className="mt-2 text-xs text-emerald-500 font-semibold">
                {consultationPercentage}%
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
