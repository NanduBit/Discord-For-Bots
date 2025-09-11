import { NextResponse } from "next/server";

// Simple cache for individual emoji data
interface EmojiCache {
  guildId: string;     // Guild ID
  emojiId: string;     // Emoji ID
  emojiData: any;      // The cached emoji data
  expiresAt: number;   // Timestamp when this cache expires
}

const CACHE_TTL = 60 * 1000; // 1 minute cache
const emojiCache: EmojiCache[] = [];

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = emojiCache.length;
  
  // Remove expired entries
  for (let i = emojiCache.length - 1; i >= 0; i--) {
    if (emojiCache[i].expiresAt < now) {
      emojiCache.splice(i, 1);
    }
  }
  
  if (initialLength !== emojiCache.length) {
    console.log(`Cleaned ${initialLength - emojiCache.length} expired emoji cache entries`);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guildId: string; emojiId: string }> }
) {
  try {
    const { token } = await request.json();
    const { guildId, emojiId } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
    }

    if (!guildId || !emojiId) {
      return NextResponse.json(
        { error: "Missing guild ID or emoji ID" },
        { status: 400 }
      );
    }

    // Clean cache before checking
    cleanCache();

    // Check if emoji exists in cache
    const now = Date.now();
    const cachedEmoji = emojiCache.find(
      (entry) => entry.guildId === guildId && entry.emojiId === emojiId
    );

    if (cachedEmoji && cachedEmoji.expiresAt > now) {
      console.log(`Returning cached emoji data for ${emojiId} in guild ${guildId}`);
      return NextResponse.json(cachedEmoji.emojiData);
    }

    // If not in cache, fetch from Discord API
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/emojis/${emojiId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "DiscordForBots/1.0.0",
        },
      }
    );

    // Handle rate limit headers
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
      // Handle rate limiting
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '5';
        console.error(`Rate limited. Retry after ${retryAfter} seconds`);
        
        return NextResponse.json(
          { error: "Rate limited by Discord API", retryAfter },
          { status: 429, headers }
        );
      }
      
      // Handle 404 specifically
      if (res.status === 404) {
        return NextResponse.json(
          { error: "Emoji not found" },
          { status: 404, headers }
        );
      }

      const errorText = await res.text();
      return NextResponse.json(
        { error: `Discord API error: ${res.status} ${errorText}` },
        { status: res.status, headers }
      );
    }

    const emojiData = await res.json();
    
    // Add CDN URL if not present
    if (emojiData && !emojiData.url) {
      const extension = emojiData.animated ? 'gif' : 'webp';
      emojiData.url = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}?size=48&quality=lossless`;
    }

    // Store in cache
    const newCacheEntry: EmojiCache = {
      guildId,
      emojiId,
      emojiData,
      expiresAt: Date.now() + CACHE_TTL,
    };

    // Remove old entry if exists
    const existingIndex = emojiCache.findIndex(
      (entry) => entry.guildId === guildId && entry.emojiId === emojiId
    );
    if (existingIndex !== -1) {
      emojiCache.splice(existingIndex, 1);
    }

    // Add new entry to cache
    emojiCache.push(newCacheEntry);

    return NextResponse.json(emojiData, { headers });
  } catch (error: any) {
    console.error("Error fetching emoji:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
