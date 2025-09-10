import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

// Define the correct parameter types for Next.js 15.x
// Define runtime and dynamic behavior
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { guildId: string; channelId: string } }
): Promise<NextResponse> {
  const { token } = await request.json();
  const { channelId } = params;

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