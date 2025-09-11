import { NextRequest, NextResponse } from 'next/server';

// Simple cache for guild data
interface GuildCacheEntry {
  id: string;           // Guild ID 
  guildData: any;       // The cached guild data
  expiresAt: number;    // Timestamp when this cache expires
}

const CACHE_TTL = 60 * 1000; // 1 minute cache
const guildCache: GuildCacheEntry[] = [];

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = guildCache.length;
  
  // Remove expired entries
  for (let i = guildCache.length - 1; i >= 0; i--) {
    if (guildCache[i].expiresAt < now) {
      guildCache.splice(i, 1);
    }
  }
  
  if (initialLength !== guildCache.length) {
    console.log(`Cleaned ${initialLength - guildCache.length} expired guild cache entries`);
  }
}


export async function POST(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  try {
    const { token } = await request.json();
    const { guildId } = await params;

    if (!token) {
      return NextResponse.json({ error: "Missing bot token" }, { status: 400 });
    }
    
    // Clean cache before checking
    cleanCache();
    
    // Check if guild exists in cache
    const now = Date.now();
    const cachedGuild = guildCache.find(entry => entry.id === guildId);
    
    if (cachedGuild && cachedGuild.expiresAt > now) {
      console.log(`Returning cached guild data for ${guildId}`);
      return NextResponse.json(cachedGuild.guildData);
    }
    
    // If not in cache, fetch from Discord API
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "DiscordForBots/1.0.0"
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Discord API error: ${res.status} ${errorText}` },
        { status: res.status }
      );
    }

    const guildData = await res.json();
    
    // Store in cache
    const newCacheEntry: GuildCacheEntry = {
      id: guildId,
      guildData,
      expiresAt: Date.now() + CACHE_TTL
    };
    
    // Remove old entry if exists
    const existingIndex = guildCache.findIndex(entry => entry.id === guildId);
    if (existingIndex !== -1) {
      guildCache.splice(existingIndex, 1);
    }
    
    // Add new entry to cache
    guildCache.push(newCacheEntry);
    
    return NextResponse.json(guildData);
  } catch (error: any) {
    console.error("Error fetching guild:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}


