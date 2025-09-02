import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 500 });
  }

  try {
    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch identity" },
        { status: res.status }
      );
    }

    const identity = await res.json();
    return NextResponse.json(identity);
  } catch (err: any) {
    console.error(err);
  }
}
