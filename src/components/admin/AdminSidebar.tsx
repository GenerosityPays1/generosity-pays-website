"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineFunnel,
  HiOutlineBuildingStorefront,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineFolder,
  HiOutlineEnvelope,
  HiOutlineServerStack,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAdminAuth } from "./AdminAuthProvider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <HiOutlineSquares2X2 className="w-5 h-5" />,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: <HiOutlineUsers className="w-5 h-5" />,
  },
  {
    label: "Pipeline",
    href: "/admin/pipeline",
    icon: <HiOutlineFunnel className="w-5 h-5" />,
  },
  {
    label: "Merchants",
    href: "/admin/merchants",
    icon: <HiOutlineBuildingStorefront className="w-5 h-5" />,
  },
  {
    label: "Fee Analysis",
    href: "/admin/fee-analysis",
    icon: <HiOutlineDocumentText className="w-5 h-5" />,
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    icon: <HiOutlineCalendarDays className="w-5 h-5" />,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: <HiOutlineChartBar className="w-5 h-5" />,
  },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: <HiOutlineFolder className="w-5 h-5" />,
  },
  {
    label: "Contacts",
    href: "/admin/contacts",
    icon: <HiOutlineEnvelope className="w-5 h-5" />,
  },
  {
    label: "Logs",
    href: "/admin/logs",
    icon: <HiOutlineServerStack className="w-5 h-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <HiOutlineCog6Tooth className="w-5 h-5" />,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Generosity Pays</h1>
          <span className="px-2 py-0.5 bg-primary/20 text-primary-light text-xs font-semibold rounded-md">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active
                  ? "bg-primary/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
              )}
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="border-t border-gray-800 my-3" />

        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                active
                  ? "bg-primary/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
              )}
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
