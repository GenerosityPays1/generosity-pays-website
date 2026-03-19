"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiChevronRight,
  HiChevronLeft,
  HiArrowPath,
  HiBuildingStorefront,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

interface Merchant {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  monthly_volume: number | null;
  pipeline_stage: string;
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

const STAGE_HEADER_COLORS: Record<string, string> = {
  new_lead: "bg-blue-500",
  contacted: "bg-yellow-500",
  fee_analysis_sent: "bg-orange-500",
  negotiation: "bg-purple-500",
  application_submitted: "bg-indigo-500",
  approved: "bg-emerald-500",
  installed: "bg-teal-500",
  active_merchant: "bg-green-500",
};

export default function PipelinePage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingStage, setChangingStage] = useState<number | null>(null);

  const fetchMerchants = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/merchants?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMerchants(data.merchants);
      }
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleStageChange = async (merchantId: number, newStage: string) => {
    if (!token) return;
    setChangingStage(merchantId);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/stage`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        await fetchMerchants();
      }
    } catch (error) {
      console.error("Failed to update stage:", error);
    } finally {
      setChangingStage(null);
    }
  };

  const getMerchantsForStage = (stageKey: string) => {
    return merchants.filter((m) => m.pipeline_stage === stageKey);
  };

  const getStageIndex = (stageKey: string) => {
    return STAGES.findIndex((s) => s.key === stageKey);
  };

  const formatVolume = (volume: number | null) => {
    if (!volume) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(volume);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              className="min-w-[250px] bg-gray-50 rounded-xl p-3 flex-shrink-0"
            >
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Merchant Pipeline
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {merchants.length} total merchants across all stages
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchMerchants();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <HiArrowPath className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Pipeline Board */}
      {merchants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <EmptyState
            icon={<HiBuildingStorefront className="w-8 h-8" />}
            title="No merchants yet"
            description="Add merchants to see them in the pipeline view."
            action={{
              label: "Go to Merchants",
              onClick: () => router.push("/admin/merchants"),
            }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="inline-flex gap-4 min-w-full">
            {STAGES.map((stage, stageIdx) => {
              const stageMerchants = getMerchantsForStage(stage.key);
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: stageIdx * 0.05 }}
                  className="min-w-[250px] bg-gray-50 rounded-xl p-3 flex flex-col gap-2 flex-shrink-0"
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${STAGE_HEADER_COLORS[stage.key]}`}
                    />
                    <h3 className="text-sm font-semibold text-gray-700 truncate">
                      {stage.label}
                    </h3>
                    <span className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                      {stageMerchants.length}
                    </span>
                  </div>

                  {/* Merchant Cards */}
                  {stageMerchants.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No merchants
                    </div>
                  ) : (
                    stageMerchants.map((merchant) => {
                      const currentIdx = getStageIndex(merchant.pipeline_stage);
                      const canMoveBack = currentIdx > 0;
                      const canMoveForward = currentIdx < STAGES.length - 1;
                      const isChanging = changingStage === merchant.id;

                      return (
                        <div
                          key={merchant.id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                          onClick={() =>
                            router.push(`/admin/merchants/${merchant.id}`)
                          }
                        >
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {merchant.business_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {merchant.contact_name}
                          </p>
                          {merchant.monthly_volume && (
                            <p className="text-xs text-gray-400 mt-1">
                              Vol: {formatVolume(merchant.monthly_volume)}
                            </p>
                          )}

                          {/* Stage Move Buttons */}
                          <div
                            className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              disabled={!canMoveBack || isChanging}
                              onClick={() =>
                                handleStageChange(
                                  merchant.id,
                                  STAGES[currentIdx - 1].key
                                )
                              }
                              className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={
                                canMoveBack
                                  ? `Move to ${STAGES[currentIdx - 1].label}`
                                  : undefined
                              }
                            >
                              <HiChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex-1 text-center">
                              {isChanging ? (
                                <span className="text-xs text-gray-400">
                                  Moving...
                                </span>
                              ) : (
                                <StatusBadge
                                  status={merchant.pipeline_stage}
                                  type="pipeline"
                                />
                              )}
                            </div>
                            <button
                              disabled={!canMoveForward || isChanging}
                              onClick={() =>
                                handleStageChange(
                                  merchant.id,
                                  STAGES[currentIdx + 1].key
                                )
                              }
                              className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={
                                canMoveForward
                                  ? `Move to ${STAGES[currentIdx + 1].label}`
                                  : undefined
                              }
                            >
                              <HiChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
