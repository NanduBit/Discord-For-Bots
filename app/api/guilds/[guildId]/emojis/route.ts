import { NextResponse } from "next/server";

// Simple cache for guild emojis
interface EmojisCache {
  guildId: string;      // Guild ID
  emojis: any[];        // The cached emoji data
  expiresAt: number;    // Timestamp when this cache expires
}

const CACHE_TTL = 60 * 1000; // 1 minute cache
const emojisCache: EmojisCache[] = [];

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = emojisCache.length;
  
  // Remove expired entries
  for (let i = emojisCache.length - 1; i >= 0; i--) {
    if (emojisCache[i].expiresAt < now) {
      emojisCache.splice(i, 1);
    }
  }
  
  if (initialLength !== emojisCache.length) {
    console.log(`Cleaned ${initialLength - emojisCache.length} expired emojis cache entries`);
  }
}

export async function POST(request: Request, { params }: { params: { guildId: string } }) {
  try {
    const { token } = await request.json();
    const { guildId } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
    }
    
    // Clean cache before checking
    cleanCache();
    
    // Check if emojis exist in cache
    const now = Date.now();
    const cachedEmojis = emojisCache.find(entry => entry.guildId === guildId);
    
    if (cachedEmojis && cachedEmojis.expiresAt > now) {
      console.log(`Returning cached emojis data for guild ${guildId}`);
      return NextResponse.json(cachedEmojis.emojis);
    }
    
    // If not in cache, fetch from Discord API
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/emojis`,
      {
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "DiscordForBots/1.0.0"
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
      // If we're being rate limited, indicate when we can retry
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '5';
        console.error(`Rate limited. Retry after ${retryAfter} seconds`);
        
        return NextResponse.json(
          { error: "Rate limited by Discord API", retryAfter },
          { status: 429, headers }
        );
      }
      
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Discord API error: ${res.status} ${errorText}` },
        { status: res.status, headers }
      );
    }

    const emojis = await res.json();
    
    // Store in cache
    const newCacheEntry: EmojisCache = {
      guildId,
      emojis,
      expiresAt: Date.now() + CACHE_TTL
    };
    
    // Remove old entry if exists
    const existingIndex = emojisCache.findIndex(entry => entry.guildId === guildId);
    if (existingIndex !== -1) {
      emojisCache.splice(existingIndex, 1);
    }
    
    // Add new entry to cache
    emojisCache.push(newCacheEntry);
    
    return NextResponse.json(emojis, { headers });
  } catch (error: any) {
    console.error("Error fetching guild emojis:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
