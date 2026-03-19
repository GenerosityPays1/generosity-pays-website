"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: number;
  username: string;
}

interface AdminAuthContextType {
  token: string | null;
  user: AdminUser | null;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  token: null,
  user: null,
  logout: () => {},
  isLoading: true,
});

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

export default function AdminAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem("admin_token");

      if (!storedToken) {
        document.cookie = "admin_token=; path=/; max-age=0";
        router.push("/admin/login");
        return;
      }

      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.ok) {
          localStorage.removeItem("admin_token");
          document.cookie = "admin_token=; path=/; max-age=0";
          router.push("/admin/login");
          return;
        }

        const data = await res.json();
        setToken(storedToken);
        setUser(data.user);
      } catch {
        localStorage.removeItem("admin_token");
        document.cookie = "admin_token=; path=/; max-age=0";
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-primary mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ token, user, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
