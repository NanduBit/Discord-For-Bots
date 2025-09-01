"use client"

import Image from "next/image"
import useSWR from "swr"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

type Guild = {
  id: string
  name: string
  icon?: string | null
}

export function ServerBar() {
  const { data: guilds = [] } = useSWR<Guild[]>("/api/guilds", (u) => fetch(u).then((r) => r.json()))

  const pathname = usePathname()
  const router = useRouter()
  const segments = (pathname || "/").split("/").filter(Boolean)
  const activeGuildId = segments[0] || null

  useEffect(() => {
    if ((pathname === "/" || pathname === "") && guilds.length > 0) {
      router.replace(`/${guilds[0].id}`)
    }
  }, [pathname, guilds, router])

  const selectGuild = (g: Guild) => {
    router.push(`/${g.id}`)
  }

  return (
    <nav className="flex h-dvh w-16 flex-col items-center justify-between border-r border-white/5 bg-slate-950/90">
      <div className="flex flex-col items-center gap-3 pt-4">
        {guilds.map((g) => {
          const src = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : "/guild-icon.png"
          const isActive = g.id === activeGuildId
          return (
            <button
              key={g.id}
              onClick={() => selectGuild(g)}
              className={`h-10 w-10 overflow-hidden rounded-xl bg-slate-800 ring-2 transition focus:outline-none ${
                isActive ? "ring-slate-300" : "ring-transparent"
              }`}
              aria-label={`Select ${g.name}`}
              title={g.name}
            >
              <Image
                src={src || "/placeholder.svg"}
                alt={`${g.name} icon`}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </button>
          )
        })}
      </div>
      <div className="h-12" />
    </nav>
  )
}

export default ServerBar
