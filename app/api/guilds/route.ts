// app/api/guilds/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }

  try {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bot ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch guilds" },
        { status: res.status }
      );
    }

    const guilds = await res.json();
    return NextResponse.json(guilds);
  } catch (err: any) {
    console.error("Guild fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}