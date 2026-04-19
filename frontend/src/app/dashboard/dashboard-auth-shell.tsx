"use client"

import { RequireAuth } from "@/components/Auth/RequireAuth"

export function DashboardAuthShell({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAuth>{children}</RequireAuth>
}
