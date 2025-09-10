import { NextRequest, NextResponse } from "next/server";

type Message = {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string | null;
  };
};

// Using the correct Next.js 15.x App Router pattern
export async function POST(
  request: NextRequest,
  context: { params: { guildId: string; channelId: string } }
) {
  const { token } = await request.json();
  const { channelId } = context.params;

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=30`,
      {
        headers: { Authorization: `Bot ${token}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: res.status }
      );
    }

    const messages: Message[] = await res.json();

    // Simplify return data (strip unnecessary fields)
    const simplified = messages.reverse();

    return NextResponse.json(simplified);
  } catch (err: any) {
    console.error("Messages fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}