import type { NextRequest } from "next/server";
// Use the native Response object which is supported by Next.js 15.x

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

// Define runtime and dynamic behavior
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ guildId: string; channelId: string }> }
): Promise<Response> {
  const { token } = await request.json();
  const params = await context.params;
  const { channelId } = params;

  if (!token) {
    return Response.json({ error: "Missing bot token" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=30`,
      {
        headers: { Authorization: `Bot ${token}` },
      }
    );

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch messages" },
        { status: res.status }
      );
    }

    const messages: Message[] = await res.json();

    // Simplify return data (strip unnecessary fields)
    const simplified = messages.reverse();

    return Response.json(simplified);
  } catch (err: any) {
    console.error("Messages fetch error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}