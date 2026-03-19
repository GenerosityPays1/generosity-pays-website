"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineChatBubbleLeftEllipsis,
  HiCheck,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import EmptyState from "@/components/admin/EmptyState";

interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  created_at: string;
  [key: string]: unknown;
}

interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ContactsPage() {
  const { token } = useAdminAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Message modal state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data: ContactsResponse = await res.json();
      setContacts(data.contacts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleToggle = async (
    id: number,
    field: "read" | "replied",
    value: boolean
  ) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Update failed");
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, [field]: value });
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + "...";
  };

  const columns: Column<Contact>[] = [
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
        <div className="flex items-center gap-2">
          {!item.read && (
            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
          )}
          <span
            className={`font-medium ${item.read ? "text-gray-700" : "text-gray-900"}`}
          >
            {item.name}
          </span>
        </div>
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
      key: "message",
      label: "Message",
      render: (item) => (
        <span className="text-gray-600">{truncateMessage(item.message)}</span>
      ),
    },
    {
      key: "read",
      label: "Read",
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(item.id, "read", !item.read);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            item.read
              ? "text-green-700 bg-green-50 hover:bg-green-100"
              : "text-gray-500 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {item.read ? (
            <>
              <HiOutlineEye className="w-3.5 h-3.5" />
              Read
            </>
          ) : (
            <>
              <HiOutlineEyeSlash className="w-3.5 h-3.5" />
              Unread
            </>
          )}
        </button>
      ),
    },
    {
      key: "replied",
      label: "Replied",
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(item.id, "replied", !item.replied);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            item.replied
              ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
              : "text-gray-500 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {item.replied ? (
            <>
              <HiCheck className="w-3.5 h-3.5" />
              Replied
            </>
          ) : (
            <>
              <HiOutlineChatBubbleLeftEllipsis className="w-3.5 h-3.5" />
              Not Replied
            </>
          )}
        </button>
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
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage messages from the contact form
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && contacts.length === 0 ? (
          <EmptyState
            icon={<HiOutlineEnvelope className="w-8 h-8" />}
            title="No contact messages"
            description="Contact form submissions will appear here."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={contacts}
              loading={loading}
              onRowClick={(item) => {
                setSelectedContact(item);
                if (!item.read) {
                  handleToggle(item.id, "read", true);
                }
              }}
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

      {/* Message Detail Modal */}
      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title="Message Details"
        size="lg"
      >
        {selectedContact && (
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {selectedContact.name}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedContact.email}
                </a>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Date
                </label>
                <p className="text-sm text-gray-700">
                  {new Date(selectedContact.created_at).toLocaleDateString(
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
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedContact.read
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedContact.read ? "Read" : "Unread"}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedContact.replied
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedContact.replied ? "Replied" : "Not Replied"}
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Message
              </label>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedContact.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() =>
                  handleToggle(
                    selectedContact.id,
                    "read",
                    !selectedContact.read
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                  selectedContact.read
                    ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                    : "text-green-700 bg-green-50 hover:bg-green-100"
                }`}
              >
                {selectedContact.read ? (
                  <>
                    <HiOutlineEyeSlash className="w-4 h-4" />
                    Mark Unread
                  </>
                ) : (
                  <>
                    <HiOutlineEye className="w-4 h-4" />
                    Mark Read
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  handleToggle(
                    selectedContact.id,
                    "replied",
                    !selectedContact.replied
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                  selectedContact.replied
                    ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                    : "text-blue-700 bg-blue-50 hover:bg-blue-100"
                }`}
              >
                {selectedContact.replied ? (
                  <>
                    <HiOutlineChatBubbleLeftEllipsis className="w-4 h-4" />
                    Mark Not Replied
                  </>
                ) : (
                  <>
                    <HiCheck className="w-4 h-4" />
                    Mark Replied
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
