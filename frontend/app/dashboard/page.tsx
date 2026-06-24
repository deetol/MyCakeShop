"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in → redirect to login
        router.push("/login");
      } else if (user.role === 'customer') {
        // Regular user → redirect to profile page
        router.push("/profile");
      } else if (user.role === 'admin') {
        // Admin → redirect to admin dashboard
        router.push("/admin");
      }
    }
  }, [loading, user, router]);

  // Show loading while checking
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant font-medium">Mengalihkan...</p>
      </div>
    </div>
  );
}