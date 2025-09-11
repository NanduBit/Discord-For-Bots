import { NextResponse } from "next/server";

// Improved in-memory cache for API responses with expiration time
interface SingleStickerCache {
  stickerId: string;    // Sticker ID as a separate field
  data: any;            // The cached sticker data
  expiresAt: number;    // Timestamp when this cache expires
}

const singleStickerCache: SingleStickerCache[] = [];
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  const initialLength = singleStickerCache.length;
  
  // Remove expired entries
  for (let i = singleStickerCache.length - 1; i >= 0; i--) {
    if (singleStickerCache[i].expiresAt < now) {
      singleStickerCache.splice(i, 1);
    }
  }
  
  if (initialLength !== singleStickerCache.length) {
    console.log(`Cleaned ${initialLength - singleStickerCache.length} expired single sticker cache entries`);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guildId: string; stickerId: string }> }
) {
  try {
    const { guildId, stickerId } = await params;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }

    // Clean cache before checking
    cleanCache();
    
    // Check cache first - using only stickerId as the key
    const now = Date.now();
    const cachedSticker = singleStickerCache.find(entry => entry.stickerId === stickerId);
    
    if (cachedSticker && cachedSticker.expiresAt > now) {
      console.log(`Using cached sticker data for ${stickerId}`);
      return NextResponse.json(cachedSticker.data);
    }

    // Fetch sticker from Discord API
    const response = await fetch(
      `https://discord.com/api/v10/stickers/${stickerId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Handle common error cases
      if (response.status === 404) {
        return NextResponse.json({ error: "Sticker not found" }, { status: 404 });
      }
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch sticker data" },
        { status: response.status }
      );
    }

    const stickerData = await response.json();
    
    // Add CDN URLs based on sticker format
    // Format types: 1 = PNG, 2 = APNG, 3 = Lottie
    if (stickerData.format_type === 3) {
      // Lottie stickers need a JSON renderer
      stickerData.lottie_url = `https://cdn.discordapp.com/stickers/${stickerId}.json`;
      stickerData.cdn_url = stickerData.lottie_url;
    } 
    else if (stickerData.format_type === 2) {
      // APNG stickers
      stickerData.apng_url = `https://cdn.discordapp.com/stickers/${stickerId}.png`;
      stickerData.cdn_url = stickerData.apng_url;
      // Also provide a static version
      stickerData.static_url = `https://cdn.discordapp.com/stickers/${stickerId}.png?static=true`;
    }
    else {
      // Standard PNG stickers
      stickerData.image_url = `https://cdn.discordapp.com/stickers/${stickerId}.png`;
      stickerData.cdn_url = stickerData.image_url;
    }
    
    // Store in cache using the new structure
    const expiresAt = now + CACHE_EXPIRY;
    
    // Remove any existing cache entry for this sticker
    const existingIndex = singleStickerCache.findIndex(entry => entry.stickerId === stickerId);
    if (existingIndex !== -1) {
      singleStickerCache.splice(existingIndex, 1);
    }
    
    // Add the new cache entry
    singleStickerCache.push({
      stickerId,
      data: stickerData,
      expiresAt
    });
    
    console.log(`Cached sticker ${stickerId}, expires in ${CACHE_EXPIRY/60000} minutes`);

    return NextResponse.json(stickerData);
  } catch (error) {
    console.error("Error fetching sticker:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
