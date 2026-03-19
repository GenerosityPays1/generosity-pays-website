"use client";

import React from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export type { Column, DataTableProps };

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-xs uppercase text-gray-500 tracking-wider px-4 py-3 font-semibold ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs uppercase text-gray-500 tracking-wider px-4 py-3 font-semibold ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-gray-700 ${col.className || ""}`}
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as React.ReactNode) ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
