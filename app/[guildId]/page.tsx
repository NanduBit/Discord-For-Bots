import { redirect } from "next/navigation"

async function getChannels(guildId: string) {
  try {
    const res = await fetch(`/api/guilds/${guildId}/channels`, { cache: "no-store" })
    if (!res.ok) return []
    return (await res.json()) as { id: string; name: string }[]
  } catch {
    return []
  }
}

export default async function GuildPage({ params }: { params: { guildId: string } }) {
  const channels = await getChannels(params.guildId)
  if (channels.length > 0) {
    redirect(`/${params.guildId}/${channels[0].id}`)
  }
  return <main className="flex h-dvh items-center justify-center text-slate-400">This server has no channels.</main>
}
