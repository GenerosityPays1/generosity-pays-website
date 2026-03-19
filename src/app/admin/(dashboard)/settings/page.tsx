"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

interface FormMessage {
  type: "success" | "error";
  text: string;
}

export default function SettingsPage() {
  const { token, user } = useAdminAuth();

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<FormMessage | null>(
    null
  );

  // Email form state
  const [emailForm, setEmailForm] = useState({
    email: "",
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<FormMessage | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    if (!token) return;
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordMessage({
          type: "error",
          text: data.error || "Failed to update password.",
        });
        return;
      }

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    if (!emailForm.email || !emailForm.email.includes("@")) {
      setEmailMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!token) return;
    setEmailLoading(true);

    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailForm.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailMessage({
          type: "error",
          text: data.error || "Failed to update email.",
        });
        return;
      }

      setEmailMessage({
        type: "success",
        text: "Email updated successfully.",
      });
    } catch {
      setEmailMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const MessageBanner = ({ message }: { message: FormMessage }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
        message.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {message.type === "success" ? (
        <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0" />
      )}
      {message.text}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <HiOutlineLockClosed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>
              <p className="text-xs text-gray-500">
                Update your account password
              </p>
            </div>
          </div>

          {passwordMessage && <MessageBanner message={passwordMessage} />}

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 mt-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </motion.div>

        {/* Update Email Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <HiOutlineEnvelope className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Update Email
              </h2>
              <p className="text-xs text-gray-500">
                Change your notification email
              </p>
            </div>
          </div>

          {emailMessage && <MessageBanner message={emailMessage} />}

          <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailForm.email}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, email: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={
                  user?.username
                    ? `Current: ${user.username}`
                    : "Enter new email"
                }
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
