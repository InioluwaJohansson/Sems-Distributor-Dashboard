"use client"

import type React from "react"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6 mt-16 w-full max-w-full">{children}</main>
    </div>
  )
}
