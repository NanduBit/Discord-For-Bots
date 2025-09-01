"use client"

import Image from "next/image"

export function ChatMessage({
  name,
  time,
  text,
}: {
  name: string
  time: string
  text: string
}) {
  return (
    <article className="flex items-start gap-3">
      <Image
        src={"/placeholder.svg?height=36&width=36&query=avatar"}
        width={36}
        height={36}
        alt={`${name} avatar`}
        className="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <header className="flex items-baseline gap-2">
          <h3 className="text-sm font-medium text-slate-200">{name}</h3>
          <span className="text-xs text-slate-500">{time}</span>
        </header>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-200">{text}</p>
      </div>
    </article>
  )
}
