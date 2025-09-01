import { NextResponse } from "next/server";

export async function GET() {
  const token = req.headers.get("x-bot-token");


  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 500 });
  }

  try {
    const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch guilds", details: error },
        { status: response.status }
      );
    }

    const guilds = await response.json();


    return NextResponse.json(guilds);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
