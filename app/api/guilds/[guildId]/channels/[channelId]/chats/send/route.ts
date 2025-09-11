import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guildId: string; channelId: string }> }
) {
  const { token, content } = await request.json();
  const { channelId } = await params;

  if (!token || !content) {
    return NextResponse.json(
      { error: "Missing bot token or message content" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to send message", details: err },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Send message error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}