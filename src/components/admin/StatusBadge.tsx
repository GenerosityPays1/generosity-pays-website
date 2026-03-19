"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "lead" | "pipeline" | "appointment";
}

const leadColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  not_interested: "bg-red-100 text-red-800",
};

const pipelineColors: Record<string, string> = {
  new_lead: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  fee_analysis_sent: "bg-orange-100 text-orange-800",
  negotiation: "bg-purple-100 text-purple-800",
  application_submitted: "bg-indigo-100 text-indigo-800",
  approved: "bg-emerald-100 text-emerald-800",
  installed: "bg-teal-100 text-teal-800",
  active_merchant: "bg-green-100 text-green-800",
};

const appointmentColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};

function getColorClasses(status: string, type?: string): string {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");

  if (type === "lead" && leadColors[normalizedStatus]) {
    return leadColors[normalizedStatus];
  }
  if (type === "pipeline" && pipelineColors[normalizedStatus]) {
    return pipelineColors[normalizedStatus];
  }
  if (type === "appointment" && appointmentColors[normalizedStatus]) {
    return appointmentColors[normalizedStatus];
  }

  // Fallback: try all mappings
  if (leadColors[normalizedStatus]) return leadColors[normalizedStatus];
  if (pipelineColors[normalizedStatus]) return pipelineColors[normalizedStatus];
  if (appointmentColors[normalizedStatus]) return appointmentColors[normalizedStatus];

  // Default
  return "bg-gray-100 text-gray-800";
}

function formatLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const colorClasses = getColorClasses(status, type);
  const label = formatLabel(status);

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses}`}
    >
      {label}
    </span>
  );
}
