import type { ReactNode } from "react"
import ServerBar from "@/components/server-bar"
import ChannelSidebar from "@/components/channel-sidebar"
import { Suspense } from "react"
import AuthGate from "@/components/auth-gate"

export default function GuildLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex h-dvh w-full bg-slate-950 text-slate-100">
        {/* Left server rail persists across navigation */}
        <ServerBar />
        {/* Channel list tied to current guild; remains mounted while channels/messages change */}
        <ChannelSidebar />
        <main className="flex-1 bg-slate-950/70">
          <Suspense fallback={<div className="h-full w-full bg-slate-950/70" aria-busy="true" />}>{children}</Suspense>
        </main>
      </div>
    </AuthGate>
  )
}
