import { NextResponse } from "next/server";

// Advanced in-memory cache with support for multiple tokens
interface CacheEntry {
  token: string;      // The token this cache entry is for
  guilds: any[];      // The cached guild data
  expiresAt: number;  // Timestamp when this cache entry expires
}

const CACHE_TTL = 60 * 1000; // 1 minute cache
let guildsCache: CacheEntry[] = [];

// Function to clean up expired cache entries
function cleanupExpiredCache() {
  const now = Date.now();
  const initialCount = guildsCache.length;
  guildsCache = guildsCache.filter(entry => entry.expiresAt > now);
  
  if (initialCount !== guildsCache.length) {
    console.log(`Cleaned up ${initialCount - guildsCache.length} expired cache entries. Remaining: ${guildsCache.length}`);
  }
}

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }
  
  // Clean up expired cache entries on each request
  cleanupExpiredCache();

  // Clean up expired cache entries
  const now = Date.now();
  guildsCache = guildsCache.filter(entry => entry.expiresAt > now);
  
  // Check if we have a valid cache entry for this token
  const cacheEntry = guildsCache.find(entry => entry.token === token);
  if (cacheEntry) {
    console.log("Returning guilds from cache for token");
    return NextResponse.json(cacheEntry.guilds);
  }

  try {
    // Add proper rate limit handling
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { 
        Authorization: `Bot ${token}`,
        // Add identifying headers to help Discord track your requests
        "User-Agent": "DiscordForBots/1.0.0"
      },
    });

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
        { error: "Failed to fetch guilds" },
        { status: res.status, headers }
      );
    }

    const guilds = await res.json();
    const guildsWithIconUrl = guilds.map((guild: any) => ({
      ...guild,
      iconUrl: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : '/defaultServerIcon.png', // Use absolute path with leading slash
    }));

    // Add or update cache entry for this token
    const newCacheEntry: CacheEntry = {
      token,
      guilds: guildsWithIconUrl,
      expiresAt: now + CACHE_TTL
    };
    
    // Remove any existing entry for this token before adding the new one
    guildsCache = guildsCache.filter(entry => entry.token !== token);
    guildsCache.push(newCacheEntry);

    return NextResponse.json(guildsWithIconUrl, { headers });
  } catch (err: any) {
    console.error("Guild fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}