import type { Metadata } from "next"
import { DashboardAuthShell } from "./dashboard-auth-shell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Panel",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardAuthShell>{children}</DashboardAuthShell>
}
