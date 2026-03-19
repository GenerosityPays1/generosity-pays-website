"use client";

import React, { useMemo } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
}: PaginationProps) {
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);

  if (totalPages <= 1 && !total) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Results count */}
      <div className="text-sm text-gray-500">
        {total !== undefined ? (
          <>
            Showing page <span className="font-medium text-gray-700">{page}</span> of{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
            {" "}({total.toLocaleString()} results)
          </>
        ) : (
          <>
            Page <span className="font-medium text-gray-700">{page}</span> of{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-gray-400 text-sm">...</span>
              )}
            </>
          )}

          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                num === page
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-400 text-sm">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
