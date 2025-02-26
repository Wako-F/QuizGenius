"use client";

import { AuthProvider } from "@/lib/contexts/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 