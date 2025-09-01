"use client"

import { Separator } from "@/components/ui/separator"
import { ChatMessage } from "./chat-message"
import { MessageInput } from "./message-input"
import useSWR from "swr"
import { useParams } from "next/navigation"

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`)
    return r.json()
  })

export function ChatArea() {
  const params = useParams() as { guildId?: string; channelId?: string }
  const guildId = Array.isArray(params.guildId) ? params.guildId[0] : params.guildId
  const channelId = Array.isArray(params.channelId) ? params.channelId[0] : params.channelId

  const endpoint =
    guildId && channelId
      ? `/api/guilds/${encodeURIComponent(String(guildId))}/channels/${encodeURIComponent(String(channelId))}`
      : null

  const { data, error, isLoading } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const apiMessages = Array.isArray(data) ? data : (data?.messages ?? [])
  const messages = (apiMessages as any[]).map((m, i) => {
    const name = m.name || m.username || m.author?.username || "user"
    const text = m.text || m.content || ""
    const rawTime = m.time || m.timestamp || m.createdAt
    const time = typeof rawTime === "string" ? rawTime : rawTime ? new Date(rawTime).toLocaleString() : ""
    const id = m.id ?? i
    return { id, name, text, time }
  })

  const channelLabel = typeof channelId === "string" ? decodeURIComponent(channelId) : "channel"

  return (
    <section className="flex h-dvh flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 pb-6 pt-24">
          <h1 id={channelLabel} className="text-balance text-3xl font-semibold tracking-tight text-slate-100">
            #{channelLabel}
          </h1>
          <p className="mt-1.5 text-slate-400">This is the beginning of this room.</p>

          <Separator className="my-6 bg-white/5" />

          {error ? (
            <div className="text-sm text-slate-400">Failed to load messages.</div>
          ) : isLoading ? (
            <div className="space-y-2 text-sm text-slate-400">Loading messages…</div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <ChatMessage key={m.id} {...m} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-8 pb-6">
        <MessageInput />
      </div>
    </section>
  )
}

export default ChatArea
