"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCalendarDays,
  HiPlus,
  HiOutlineClock,
  HiOutlineMapPin,
  HiCheck,
  HiXMark,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";

interface Appointment {
  id: number;
  title: string;
  appointment_date: string;
  duration_minutes: number;
  location: string;
  description: string;
  notes: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  totalPages: number;
}

const DURATION_OPTIONS = [15, 30, 45, 60];

export default function AppointmentsPage() {
  const { token } = useAdminAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    appointment_date: "",
    duration_minutes: 30,
    location: "",
    description: "",
    notes: "",
  });

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view: activeTab,
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/appointments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data: AppointmentsResponse = await res.json();
      setAppointments(data.appointments);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [token, page, activeTab]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      setShowModal(false);
      setFormData({
        title: "",
        appointment_date: "",
        duration_minutes: 30,
        location: "",
        description: "",
        notes: "",
      });
      fetchAppointments();
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: "completed" | "cancelled"
  ) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchAppointments();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const columns: Column<Appointment>[] = [
    {
      key: "appointment_date",
      label: "Date / Time",
      render: (item) => {
        const { date, time } = formatDateTime(item.appointment_date);
        return (
          <div>
            <div className="font-medium text-gray-900">{date}</div>
            <div className="text-xs text-gray-500">{time}</div>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.title}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <StatusBadge status={item.status} type="appointment" />
      ),
    },
    {
      key: "duration_minutes",
      label: "Duration",
      render: (item) => (
        <div className="flex items-center gap-1 text-gray-600">
          <HiOutlineClock className="w-4 h-4" />
          <span>{item.duration_minutes} min</span>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (item) =>
        item.location ? (
          <div className="flex items-center gap-1 text-gray-600">
            <HiOutlineMapPin className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[150px]">{item.location}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => {
        if (item.status === "scheduled") {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(item.id, "completed");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <HiCheck className="w-3.5 h-3.5" />
                Complete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(item.id, "cancelled");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <HiXMark className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your scheduled appointments
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && appointments.length === 0 ? (
          <EmptyState
            icon={<HiOutlineCalendarDays className="w-8 h-8" />}
            title={`No ${activeTab} appointments`}
            description={
              activeTab === "upcoming"
                ? "Schedule a new appointment to get started."
                : "Completed and cancelled appointments will appear here."
            }
            action={
              activeTab === "upcoming"
                ? {
                    label: "New Appointment",
                    onClick: () => setShowModal(true),
                  }
                : undefined
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={appointments}
              loading={loading}
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

      {/* New Appointment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Appointment"
        size="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Appointment title"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.appointment_date}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_date: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Meeting location or link"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="What is this appointment about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Internal notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Appointment"}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
