import { ServerBar } from "@/components/server-bar"
import { ChannelSidebar } from "@/components/channel-sidebar"
import { ChatArea } from "@/components/chat-area"

export default function Page() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="flex">
        <aside aria-label="Servers" className="hidden md:block">
          <ServerBar />
        </aside>
        <aside aria-label="Channels" className="hidden sm:block">
          <ChannelSidebar />
        </aside>
        <main className="flex-1">
          <ChatArea />
        </main>
      </div>
    </div>
  )
}
