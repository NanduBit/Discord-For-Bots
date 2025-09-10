import { NextResponse } from "next/server";

// Interface for member cache
interface MemberCache {
  guildId: string;     // Guild ID
  userId: string;      // User ID
  data: any;           // The cached member data
  expiresAt: number;   // Timestamp when this cache expires
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
const memberCache: MemberCache[] = [];

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = memberCache.length;
  
  // Remove expired entries
  for (let i = memberCache.length - 1; i >= 0; i--) {
    if (memberCache[i].expiresAt < now) {
      memberCache.splice(i, 1);
    }
  }
  
  if (initialLength !== memberCache.length) {
    console.log(`Cleaned ${initialLength - memberCache.length} expired member cache entries`);
  }
}

// POST: Find a specific guild member by user ID
export async function POST(
  request: Request,
  { params }: { params: { guildId: string } }
) {
  try {
    const { token, userId } = await request.json();
    const { guildId } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    
    // Clean cache before checking
    cleanCache();
    
    // Check if member exists in cache
    const now = Date.now();
    const cachedMember = memberCache.find(
      entry => entry.guildId === guildId && entry.userId === userId
    );
    
    if (cachedMember && cachedMember.expiresAt > now) {
      console.log(`Returning cached member data for user ${userId} in guild ${guildId}`);
      return NextResponse.json(cachedMember.data);
    }
    
    // If not in cache, fetch from Discord API
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
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
      
      // Handle user not found in guild
      if (res.status === 404) {
        return NextResponse.json(
          { error: `Member with ID ${userId} not found in guild ${guildId}` },
          { status: 404, headers }
        );
      }
      
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Discord API error: ${res.status} ${errorText}` },
        { status: res.status, headers }
      );
    }

    const member = await res.json();
    
    // Store in cache
    const newCacheEntry: MemberCache = {
      guildId,
      userId,
      data: member,
      expiresAt: Date.now() + CACHE_TTL
    };
    
    // Remove old entry if exists
    const existingIndex = memberCache.findIndex(
      entry => entry.guildId === guildId && entry.userId === userId
    );
    if (existingIndex !== -1) {
      memberCache.splice(existingIndex, 1);
    }
    
    // Add new entry to cache
    memberCache.push(newCacheEntry);
    
    console.log(`Cached member ${userId} for guild ${guildId}, expires in ${CACHE_TTL/60000} minutes`);
    return NextResponse.json(member, { headers });
  } catch (error: any) {
    console.error("Error fetching guild member:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET method for search compatibility, but POST is preferred
export async function GET(
  request: Request,
  { params }: { params: { guildId: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ 
      error: "Missing userId query parameter",
      hint: "For security reasons, please use POST method with the bot token in the request body"
    }, { status: 400 });
  }
  
  return NextResponse.json({ 
    message: `For security reasons, please use POST method to fetch member ${userId} for guild ${params.guildId}`,
    hint: "Send a POST request with the bot token in the request body"
  });
}
