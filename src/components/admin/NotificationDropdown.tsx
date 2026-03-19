"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiBell, HiCheckCircle, HiExclamationTriangle, HiInformationCircle } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

interface Notification {
  id: number | string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  entity_type?: string;
  entity_id?: number | string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <HiInformationCircle className="w-5 h-5 text-blue-500" />,
  success: <HiCheckCircle className="w-5 h-5 text-green-500" />,
  warning: <HiExclamationTriangle className="w-5 h-5 text-yellow-500" />,
  error: <HiExclamationTriangle className="w-5 h-5 text-red-500" />,
};

const entityRoutes: Record<string, string> = {
  lead: "/admin/leads",
  merchant: "/admin/merchants",
  contact: "/admin/contacts",
  appointment: "/admin/appointments",
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationDropdown() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        "/api/admin/notifications?unread_only=true&limit=20",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const items = data.notifications || [];
        setNotifications(items);
        setUnreadCount(items.filter((n: Notification) => !n.read).length);
      }
    } catch {
      // Silently fail on network errors
    }
  }, [token]);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch {
      // Silently fail on network errors
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.entity_type && notification.entity_id) {
      const route = entityRoutes[notification.entity_type];
      if (route) {
        router.push(`${route}/${notification.entity_id}`);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <HiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-400">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-gray-50 border-b border-gray-50 ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {typeIcons[notification.type] || typeIcons.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                onClick={handleMarkAllRead}
                className="w-full text-center text-xs font-medium text-primary hover:text-primary-dark transition-colors py-1.5"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
