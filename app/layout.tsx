import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import AuthGate from "@/components/auth-gate"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-slate-950 text-slate-100 antialiased`}>
        <Suspense fallback={<div className="fixed inset-0 bg-slate-950" aria-busy="true" aria-live="polite" />}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
