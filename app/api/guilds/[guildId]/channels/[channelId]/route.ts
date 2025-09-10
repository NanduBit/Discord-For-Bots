import { NextResponse } from "next/server";

// In-memory cache for channel details per guild/channel
type ChannelCache = {
  [guildId: string]: {
    [channelId: string]: {
      data: any;
      timestamp: number;
    };
  };
};

const channelsCache: ChannelCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

type Channel = {
  id: string;
  name: string;
  type: number;
  position: number;
  parent_id?: string | null;
  topic?: string | null;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rtc_region?: string | null;
  permission_overwrites?: any[];
};

export async function POST(
  request: Request,
  { params }: { params: { guildId: string; channelId: string } }
) {
  const { token } = await request.json();
  const { guildId, channelId } = await params;

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }

  // Serve from cache if not expired
  const now = Date.now();
  if (
    channelsCache[guildId] &&
    channelsCache[guildId][channelId] &&
    now - channelsCache[guildId][channelId].timestamp < CACHE_TTL
  ) {
    return NextResponse.json(channelsCache[guildId][channelId].data);
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      { headers: { Authorization: `Bot ${token}` } }
    );

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '5';
        return NextResponse.json(
          { error: "Rate limited by Discord API", retryAfter },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch channel" },
        { status: res.status }
      );
    }

    const channel: Channel = await res.json();

    // Cache result
    if (!channelsCache[guildId]) channelsCache[guildId] = {};
    channelsCache[guildId][channelId] = { data: channel, timestamp: now };

    return NextResponse.json(channel);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
