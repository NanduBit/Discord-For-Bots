import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    const token = req.headers.get("x-bot-token");
    if (!token || typeof token !== "string") {
      return Response.json({ valid: false, error: "Missing token" }, { status: 400 })
    }

    const resp = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!resp.ok) {
      return Response.json({ valid: false, error: "Invalid token" }, { status: 401 })
    }

    const identity = await resp.json()
    return Response.json({ valid: true, identity })
  } catch {
    return Response.json({ valid: false, error: "Validation error" }, { status: 500 })
  }
}
