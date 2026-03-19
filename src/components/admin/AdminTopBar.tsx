"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HiOutlineBars3, HiOutlineBell } from "react-icons/hi2";
import { useAdminAuth } from "./AdminAuthProvider";

const pageTitleMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/leads": "Leads",
  "/admin/pipeline": "Pipeline",
  "/admin/merchants": "Merchants",
  "/admin/fee-analysis": "Fee Analysis",
  "/admin/appointments": "Appointments",
  "/admin/analytics": "Analytics",
  "/admin/documents": "Documents",
  "/admin/contacts": "Contacts",
  "/admin/settings": "Settings",
};

interface AdminTopBarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function AdminTopBar({
  onMenuToggle,
  pageTitle,
}: AdminTopBarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const resolvedTitle =
    pageTitle || pageTitleMap[pathname] || "Dashboard";

  const userInitial = user?.username?.charAt(0).toUpperCase() || "A";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 className="w-6 h-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          {resolvedTitle}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
              {userInitial}
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
