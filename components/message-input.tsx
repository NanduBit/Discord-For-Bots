"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import useSWR, { mutate } from "swr"

export function MessageInput() {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const params = useParams() as { guildId?: string; channelId?: string }
  
  const guildId = Array.isArray(params.guildId)
    ? params.guildId[0]
    : params.guildId
  const channelId = Array.isArray(params.channelId)
    ? params.channelId[0]
    : params.channelId
    
  const messagesEndpoint = guildId && channelId 
    ? `/api/guilds/${encodeURIComponent(String(guildId))}/channels/${encodeURIComponent(String(channelId))}` 
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !guildId || !channelId || sending) return

    try {
      setSending(true)
      const token = localStorage.getItem("token")
      const endpoint = `/api/guilds/${encodeURIComponent(String(guildId))}/channels/${encodeURIComponent(String(channelId))}/message`
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          content: message
        })
      })
      
      if (response.ok) {
        setMessage("")
        // Refresh the messages data after sending
        if (messagesEndpoint) {
          mutate(messagesEndpoint)
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/5 bg-slate-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
    >
      <label htmlFor="message" className="sr-only">
        Type your message
      </label>
      <input
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full rounded-lg bg-transparent px-1 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
        disabled={sending}
      />
    </form>
  )
}
