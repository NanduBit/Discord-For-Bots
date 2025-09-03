import { NextResponse } from "next/server";

type Channel = {
  id: string;
  name: string;
  type: number; // Discord channel type
};

export async function POST(
  request: Request,
  { params }: { params: { guildId: string } }
) {
  const { token } = await request.json();
  const guildId = params.guildId;

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: { Authorization: `Bot ${token}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch channels" },
        { status: res.status }
      );
    }

    const allChannels: Channel[] = await res.json();

    // Only keep text-based channels (type 0 = text, 5 = announcement/news, etc.)
    const textChannels = allChannels.filter((c) =>
      [0, 5, 15].includes(c.type) // 15 = forum, still text-like
    );

    // Return simplified objects
    return NextResponse.json(
      textChannels.map((c) => ({ id: c.id, name: c.name }))
    );
  } catch (err: any) {
    console.error("Channel fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}