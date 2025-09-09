import { NextResponse } from "next/server";

// Simple in-memory cache
let guildsCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
  }

  // Return from cache if available and not expired
  const now = Date.now();
  if (guildsCache && (now - cacheTimestamp < CACHE_TTL)) {
    console.log("Returning guilds from cache");
    return NextResponse.json(guildsCache);
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

    // Update cache
    guildsCache = guildsWithIconUrl;
    cacheTimestamp = now;

    return NextResponse.json(guildsWithIconUrl, { headers });
  } catch (err: any) {
    console.error("Guild fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}