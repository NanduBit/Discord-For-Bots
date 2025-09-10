import { NextResponse } from "next/server";

// Simple in-memory cache with guild ID as key
type ChannelCache = {
  [guildId: string]: {
    data: any;
    timestamp: number;
  };
};

const channelsCache: ChannelCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache

type Channel = {
  id: string;
  name: string;
  type: number; // Discord channel type
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
  { params }: { params: { guildId: string } }
) {
  const { token } = await request.json();
  const { guildId } = await params;

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }

  // Return from cache if available and not expired
  const now = Date.now();
  if (channelsCache[guildId] && (now - channelsCache[guildId].timestamp < CACHE_TTL)) {
    console.log(`Returning channels for guild ${guildId} from cache`);
    return NextResponse.json(channelsCache[guildId].data);
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: { 
          Authorization: `Bot ${token}`
        },
      }
    );

    // Forward rate limit headers if they exist
    const headers: Record<string, string> = {};
    if (res.headers.has('X-RateLimit-Limit')) {
      headers['X-RateLimit-Limit'] = res.headers.get('X-RateLimit-Limit') || '';
    }
    if (res.headers.has('X-RateLimit-Remaining')) {
      headers['X-RateLimit-Remaining'] = res.headers.get('X-RateLimit-Remaining') || '';
    }
    if (res.headers.has('X-RateLimit-Reset')) {
      headers['X-RateLimit-Reset'] = res.headers.get('X-RateLimit-Reset') || '';
    }
    if (res.headers.has('Retry-After')) {
      headers['Retry-After'] = res.headers.get('Retry-After') || '';
    }

    if (!res.ok) {
      // If we're being rate limited, indicate when we can retry
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '5';
        console.error(`Rate limited. Retry after ${retryAfter} seconds`);
        
        return NextResponse.json(
          { error: "Rate limited by Discord API", retryAfter },
          { status: 429, headers }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch channels" },
        { status: res.status, headers }
      );
    }

    const channels: Channel[] = await res.json();

    // Categories
    const categories = channels
      .filter((c) => c.type === 4)
      .sort((a, b) => a.position - b.position);

    // Text + Voice channels
    const textChannels = channels.filter((c) => c.type === 0);
    const voiceChannels = channels.filter((c) => c.type === 2);

    // Group channels under their categories
    const grouped = categories.map((cat) => ({
      category: {
        id: cat.id,
        name: cat.name,
        position: cat.position,
      },
      text_channels: textChannels
        .filter((ch) => ch.parent_id === cat.id)
        .sort((a, b) => a.position - b.position)
        .map((ch) => ({
          id: ch.id,
          name: ch.name,
          type: ch.type,
          topic: ch.topic,
          position: ch.position,
          parent_id: ch.parent_id,
          nsfw: ch.nsfw,
          rate_limit_per_user: ch.rate_limit_per_user,
          last_message_id: ch.last_message_id,
          permission_overwrites: ch.permission_overwrites,
        })),
      voice_channels: voiceChannels
        .filter((ch) => ch.parent_id === cat.id)
        .sort((a, b) => a.position - b.position)
        .map((ch) => ({
          id: ch.id,
          name: ch.name,
          type: ch.type,
          position: ch.position,
          parent_id: ch.parent_id,
          bitrate: ch.bitrate,
          user_limit: ch.user_limit,
          rtc_region: ch.rtc_region,
          permission_overwrites: ch.permission_overwrites,
        })),
    }));

    // Add "No Category" group
    const noCategoryText = textChannels
      .filter((ch) => ch.parent_id === null)
      .sort((a, b) => a.position - b.position)
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type,
        topic: ch.topic,
        position: ch.position,
        parent_id: ch.parent_id,
        nsfw: ch.nsfw,
        rate_limit_per_user: ch.rate_limit_per_user,
        last_message_id: ch.last_message_id,
        permission_overwrites: ch.permission_overwrites,
      }));

    const noCategoryVoice = voiceChannels
      .filter((ch) => ch.parent_id === null)
      .sort((a, b) => a.position - b.position)
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type,
        position: ch.position,
        parent_id: ch.parent_id,
        bitrate: ch.bitrate,
        user_limit: ch.user_limit,
        rtc_region: ch.rtc_region,
        permission_overwrites: ch.permission_overwrites,
      }));

    if (noCategoryText.length > 0 || noCategoryVoice.length > 0) {
      grouped.unshift({
        category: {
          id: "no-category",
          name: "No Category",
          position: -1,
        },
        text_channels: noCategoryText,
        voice_channels: noCategoryVoice,
      });
    }

    // Update cache
    channelsCache[guildId] = {
      data: grouped,
      timestamp: now
    };

    return NextResponse.json(grouped, { headers });
  } catch (err: any) {
    console.error("Channel fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
