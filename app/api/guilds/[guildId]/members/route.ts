import { NextRequest, NextResponse } from 'next/server';

// Interface for members cache
interface MembersCache {
  guildId: string;      // Guild ID
  data: any[];          // The cached members data
  expiresAt: number;    // Timestamp when this cache expires
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const membersCache: MembersCache[] = [];

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = membersCache.length;
  
  // Remove expired entries
  for (let i = membersCache.length - 1; i >= 0; i--) {
    if (membersCache[i].expiresAt < now) {
      membersCache.splice(i, 1);
    }
  }
  
  if (initialLength !== membersCache.length) {
    console.log(`Cleaned ${initialLength - membersCache.length} expired members cache entries`);
  }
}

// POST: list members in a guild (using POST to securely pass the token in the request body)
export async function POST(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  try {
    const { token, limit = 1000 } = await request.json();
    const { guildId } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
    }
    
    // Clean cache before checking
    cleanCache();
    
    // Check if members exist in cache
    const now = Date.now();
    const cachedMembers = membersCache.find(entry => entry.guildId === guildId);
    
    if (cachedMembers && cachedMembers.expiresAt > now) {
      console.log(`Returning cached members data for guild ${guildId}`);
      return NextResponse.json(cachedMembers.data);
    }
    
    // If not in cache, fetch from Discord API
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members?limit=${limit}`,
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

    const members = await res.json();
    
    // Store in cache
    const newCacheEntry: MembersCache = {
      guildId,
      data: members,
      expiresAt: Date.now() + CACHE_TTL
    };
    
    // Remove old entry if exists
    const existingIndex = membersCache.findIndex(entry => entry.guildId === guildId);
    if (existingIndex !== -1) {
      membersCache.splice(existingIndex, 1);
    }
    
    // Add new entry to cache
    membersCache.push(newCacheEntry);
    
    console.log(`Cached members for guild ${guildId}, expires in ${CACHE_TTL/60000} minutes`);
    return NextResponse.json(members, { headers });
  } catch (error: any) {
    console.error("Error fetching guild members:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}


