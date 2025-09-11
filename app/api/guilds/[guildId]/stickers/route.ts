import { NextResponse } from "next/server";

// Improved in-memory cache for API responses with expiration time
interface StickerCache {
  guildId: string;      // Guild ID as a separate field
  data: any;            // The cached sticker data
  expiresAt: number;    // Timestamp when this cache expires
}

const stickersCache: StickerCache[] = [];
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = stickersCache.length;
  
  // Remove expired entries
  for (let i = stickersCache.length - 1; i >= 0; i--) {
    if (stickersCache[i].expiresAt < now) {
      stickersCache.splice(i, 1);
    }
  }
  
  if (initialLength !== stickersCache.length) {
    console.log(`Cleaned ${initialLength - stickersCache.length} expired stickers cache entries`);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }

    // Clean cache before checking
    cleanCache();
    
    // Check cache first - using only guildId as the key
    const now = Date.now();
    const cachedStickers = stickersCache.find(entry => entry.guildId === guildId);
    
    if (cachedStickers && cachedStickers.expiresAt > now) {
      console.log(`Using cached guild stickers for guild ${guildId}`);
      return NextResponse.json(cachedStickers.data);
    }

    // Fetch stickers from Discord API
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/stickers`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Handle common error cases
      if (response.status === 404) {
        return NextResponse.json({ error: "Guild not found" }, { status: 404 });
      }
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch guild stickers" },
        { status: response.status }
      );
    }

    const stickers = await response.json();
    
    // Store in cache using the new structure
    const expiresAt = now + CACHE_EXPIRY;
    
    // Remove any existing cache entry for this guild
    const existingIndex = stickersCache.findIndex(entry => entry.guildId === guildId);
    if (existingIndex !== -1) {
      stickersCache.splice(existingIndex, 1);
    }
    
    // Add the new cache entry
    stickersCache.push({
      guildId,
      data: stickers,
      expiresAt
    });
    
    console.log(`Cached stickers for guild ${guildId}, expires in ${CACHE_EXPIRY/60000} minutes`);

    return NextResponse.json(stickers);
  } catch (error) {
    console.error("Error fetching guild stickers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
