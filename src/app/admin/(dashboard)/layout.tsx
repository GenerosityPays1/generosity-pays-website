"use client";

import { useState } from "react";
import AdminAuthProvider from "@/components/admin/AdminAuthProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area - offset by sidebar width on large screens */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <AdminTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
