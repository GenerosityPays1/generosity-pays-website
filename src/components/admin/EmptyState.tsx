"use client";

import React from "react";
import { HiOutlineInboxStack } from "react-icons/hi2";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
        {icon || <HiOutlineInboxStack className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
