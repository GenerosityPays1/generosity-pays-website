"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import EmptyState from "@/components/admin/EmptyState";

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  availability: string | null;
  experience: string | null;
  notes: string | null;
  ip_address: string | null;
  page_source: string | null;
  created_at: string;
  [key: string]: unknown;
}

interface VolunteersResponse {
  volunteers: Volunteer[];
  total: number;
  page: number;
  totalPages: number;
}

export default function VolunteersPage() {
  const { token } = useAdminAuth();

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );

  const fetchVolunteers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/volunteers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch volunteers");
      const data: VolunteersResponse = await res.json();
      setVolunteers(data.volunteers);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const columns: Column<Volunteer>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (item) => (
        <a
          href={`mailto:${item.email}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {item.email}
        </a>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (item) => (
        <span className="text-gray-600">{item.phone || "—"}</span>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      render: (item) => (
        <span className="text-gray-600">{item.availability || "—"}</span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Volunteer Sign-ups
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage volunteer submissions from the Relay For Life page
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && volunteers.length === 0 ? (
          <EmptyState
            icon={<HiOutlineUserGroup className="w-8 h-8" />}
            title="No volunteer sign-ups"
            description="Volunteer submissions from the Relay For Life page will appear here."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={volunteers}
              loading={loading}
              onRowClick={(item) => setSelectedVolunteer(item)}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
            />
          </>
        )}
      </div>

      {/* Volunteer Detail Modal */}
      <Modal
        isOpen={!!selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        title="Volunteer Details"
        size="lg"
      >
        {selectedVolunteer && (
          <div className="space-y-5">
            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {selectedVolunteer.name}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <a
                  href={`mailto:${selectedVolunteer.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedVolunteer.email}
                </a>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <p className="text-sm text-gray-700">
                  {selectedVolunteer.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Date
                </label>
                <p className="text-sm text-gray-700">
                  {new Date(selectedVolunteer.created_at).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Availability
                </label>
                <p className="text-sm text-gray-700">
                  {selectedVolunteer.availability || "Not specified"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Source
                </label>
                <p className="text-sm text-gray-700">
                  {selectedVolunteer.page_source || "Unknown"}
                </p>
              </div>
            </div>

            {/* Experience */}
            {selectedVolunteer.experience && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Experience / Skills
                </label>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedVolunteer.experience}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedVolunteer.notes && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Additional Notes
                </label>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedVolunteer.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
