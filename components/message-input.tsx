"use client"

export function MessageInput() {
  return (
    <form
      action="#"
      className="rounded-xl border border-white/5 bg-slate-950/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
    >
      <label htmlFor="message" className="sr-only">
        Type your message
      </label>
      <input
        id="message"
        placeholder="Type your message..."
        className="w-full rounded-lg bg-transparent px-1 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
      />
    </form>
  )
}
