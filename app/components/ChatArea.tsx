"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";


// Extend Window interface to allow for our dynamic mention data properties
declare global {
  interface Window {
    [key: string]: any;
  }
}

// Message interface for TypeScript type safety
interface Author {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  public_flags?: number;
  flags?: number;
  banner?: string | null;
  accent_color?: number | null;
  global_name?: string | null;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
    expires_at: string | null;
  } | null;
  collectibles?: any | null;
  display_name_styles?: any;
  banner_color?: string | null;
  clan?: string | null;
  primary_guild?: string | null;
}

interface MessageReference {
  channel_id: string;
  message_id: string;
  guild_id?: string;
  type?: number;
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  url: string;
  proxy_url: string;
  width?: number;
  height?: number;
  content_type?: string;
  flags?: number;
  content_scan_version?: number;
  placeholder?: string;
  placeholder_version?: number;
}

interface EmbedImage {
  url: string;
  proxy_url?: string;
  width?: number;
  height?: number;
  content_type?: string;
  placeholder?: string;
  placeholder_version?: number;
  flags?: number;
}

interface EmbedVideo {
  url: string;
  proxy_url?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  placeholder_version?: number;
  flags?: number;
}

interface EmbedProvider {
  name: string;
  url?: string;
}

interface EmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

interface Embed {
  type: string;
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: EmbedImage;
  thumbnail?: EmbedImage;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  footer?: EmbedFooter;
  content_scan_version?: number;
}

interface Sticker {
  id: string;
  pack_id?: string;
  name: string;
  description: string | null;
  tags?: string;
  asset?: string;
  type: number;
  format_type: number; // 1: PNG, 2: APNG, 3: Lottie
  available?: boolean;
  guild_id?: string;
  sort_value?: number;
}

interface Message {
  id: string;
  content: string;
  author: Author & { bot?: boolean };
  type: number;
  mentions: Author[];
  mention_roles: string[];
  attachments: Attachment[];
  embeds: Embed[];
  stickers?: Sticker[];
  sticker_items?: {
    id: string;
    name: string;
    format_type: number;
  }[];
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  components: any[];
  channel_id: string;
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  message_reference?: MessageReference;
  referenced_message?: Message;
}

// Helper function to extract file extension from URL
const getFileExtension = (url: string): string | null => {
  // Remove query parameters
  const urlWithoutQuery = url.split('?')[0];
  // Extract the filename
  const filename = urlWithoutQuery.split('/').pop();
  // Get extension
  if (filename) {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop() || null;
    }
  }
  return null;
};

// Helper function to parse Discord markdown formatting
const parseDiscordMarkdown = (text: string) => {
  if (!text) return '';
  
  // Handle Discord custom emojis - format: <:emoji_name:emoji_id> or <a:emoji_name:emoji_id> for animated
  const emojiRegex = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/g;
  let processedText = text.replace(emojiRegex, (match, animated, name, id) => {
    // Check if the emoji name starts with "a_" which often indicates animation
    const isAnimated = animated || name.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'webp';
    
    // Create an element ID for potential dynamic update
    const elementId = `emoji-${id}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Fetch emoji data from our API endpoint
    const token = localStorage.getItem("token");
    if (token) {
      // Extract guild ID from URL
      const pathMatch = window.location.pathname.match(/\/app\/(\d+)(?:\/(\d+))?/);
      const guildId = pathMatch?.[1];
      
      if (guildId) {
        // Start with a default rendering
        setTimeout(async () => {
          try {
            console.log(`Fetching emoji data for ID: ${id} from guild ${guildId}`);
            
            // Try to fetch emoji data from our API
            const response = await fetch(`/api/guilds/${guildId}/emojis/${id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
            });
            
            if (response.ok) {
              const emojiData = await response.json();
              console.log(`Emoji data received for ${id}:`, emojiData);
              
              // Update the image with precise data from the API
              const emojiElement = document.getElementById(elementId);
              if (emojiElement) {
                // Get correct animated state from the API
                const correctExtension = emojiData.animated ? 'gif' : 'webp';
                const newSrc = `https://cdn.discordapp.com/emojis/${id}.${correctExtension}?size=48&quality=lossless`;
                console.log(`Updating emoji ${id} with correct extension: ${correctExtension}, URL: ${newSrc}`);
                
                // Update the element
                emojiElement.setAttribute('src', newSrc);
                emojiElement.setAttribute('title', `:${emojiData.name}:`);
                emojiElement.setAttribute('alt', `:${emojiData.name}:`);
              } else {
                console.warn(`Emoji element with ID ${elementId} not found in DOM`);
              }
            } else {
              console.log(`Emoji ${id} not found in current guild, trying direct CDN access`);
              
              // If not in current guild, try both formats directly
              const emojiElement = document.getElementById(elementId);
              if (emojiElement) {
                // Try both static and animated formats
                const tryFormats = async () => {
                  // Try gif first
                  const gifUrl = `https://cdn.discordapp.com/emojis/${id}.gif?size=48&quality=lossless`;
                  try {
                    const gifResponse = await fetch(gifUrl, { method: 'HEAD' });
                    if (gifResponse.ok) {
                      console.log(`Found animated emoji ${id}`);
                      emojiElement.setAttribute('src', gifUrl);
                      return true;
                    }
                  } catch (e) {
                    console.log(`GIF format check failed for ${id}`);
                  }
                  
                  // Try webp next
                  const webpUrl = `https://cdn.discordapp.com/emojis/${id}.webp?size=48&quality=lossless`;
                  try {
                    const webpResponse = await fetch(webpUrl, { method: 'HEAD' });
                    if (webpResponse.ok) {
                      console.log(`Found static emoji ${id}`);
                      emojiElement.setAttribute('src', webpUrl);
                      return true;
                    }
                  } catch (e) {
                    console.log(`WebP format check failed for ${id}`);
                  }
                  
                  return false;
                };
                
                await tryFormats();
              }
            }
          } catch (error) {
            console.error(`Error processing emoji ${id}:`, error);
          }
        }, 0);
      }
    }
    
    // Create a more robust implementation with progressive fallbacks
    return `<img 
      id="${elementId}"
      src="https://cdn.discordapp.com/emojis/${id}.${extension}?size=48&quality=lossless" 
      alt=":${name}:" 
      title=":${name}:" 
      style="width: 1.375em; height: 1.375em; vertical-align: bottom;"
      onerror="const img = this; if(img.src.includes('.webp')){console.log('Trying gif format for emoji ${id}'); img.src = img.src.replace('.webp','.gif');} else if(img.src.includes('.gif')){console.log('Both formats failed for emoji ${id}'); img.onerror = null; img.replaceWith(document.createTextNode(':${name}:'));}"
    />`;
  });
  
  // Handle media links in a generic way
  // We'll check for various types of media URLs and display them appropriately
  
  // Check for direct image/GIF links, but don't process if it's a URL-only message
  // This prevents duplication with embeds
  // Enhanced regex to better match Discord CDN URLs
  const imageRegex = /https?:\/\/(?:cdn\.discordapp\.com\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)|media\.discordapp\.net\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)|\S+\.(gif|png|jpg|jpeg|webp))(\?\S*)?$/i;
  const imageMatch = processedText.match(imageRegex);
  
  // Only process direct media links if this is not a URL-only message
  // This prevents duplication with embeds that Discord automatically creates
  if (imageMatch && processedText.trim() !== imageMatch[0].trim()) {
    // Extract file extension from the URL
    const fileExtension = getFileExtension(imageMatch[0]);
    const isGif = fileExtension?.toLowerCase() === 'gif';
    
    // For GIFs and images, render them without showing the URL
    return `<div style="max-width: 240px; margin: 8px 0 0 0;">
      <div style="position: relative; border-radius: 4px; overflow: hidden;">
        ${isGif ? 
        `<video 
          autoPlay 
          loop 
          muted 
          playsInline 
          style="max-width: 240px; max-height: 180px; width: auto; height: auto; display: block; border-radius: 4px;"
          poster="${imageMatch[0]}"
        >
          <source src="${imageMatch[0]}" type="video/gif">
          <img
            src="${imageMatch[0]}"
            alt="Embedded GIF"
            style="max-width: 240px; max-height: 180px; width: auto; height: auto; border-radius: 4px; display: block;"
            loading="lazy"
          />
        </video>
        <div style="position: absolute; right: 8px; bottom: 8px; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 2px 4px; border-radius: 2px; opacity: 0.7;">
          GIF
        </div>` : 
        `<img
          src="${imageMatch[0]}"
          alt="Embedded image"
          style="max-width: 240px; max-height: 180px; width: auto; height: auto; border-radius: 4px; display: block;"
          loading="lazy"
          onerror="this.style.display='none'; this.parentNode.innerHTML = '<div style=\\"padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px;\\"><a href=\\"${imageMatch[0]}\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\" style=\\"color: #00a8fc; text-decoration: none;\\">Unable to load image</a></div>';"
        />`}
      </div>
      <div style="font-size: 0.75rem; margin-top: 4px;">
        <a href="${imageMatch[0]}" target="_blank" rel="noopener noreferrer" style="color: #96989d; text-decoration: none;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
            <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Open original
        </a>
      </div>
    </div>`;
  }
  
  // Process user mentions like <@173872244924088320>
  // Create a static cache for user mentions to avoid duplicate API calls
  if (!window.userMentionCache) {
    window.userMentionCache = {};
  }
  
  // Process Discord user mention format <@USER_ID> or <@!USER_ID>
  const userMentionRegex = /<@!?(\d+)>/g;
  const pathMatch = window.location.pathname.match(/\/app\/(\d+)(?:\/(\d+))?/);
  const guildId = pathMatch?.[1];
  const token = localStorage.getItem("token");
  
  // Replace each mention with a styled username or a loading placeholder
  processedText = processedText.replace(userMentionRegex, (match, userId) => {
    // If we already have the username cached, use it immediately
    if (window.userMentionCache[userId]) {
      return `<span class="mention" style="color: #00a8fc; background-color: rgba(88, 101, 242, 0.3); border-radius: 3px; padding: 0 2px;">@${window.userMentionCache[userId]}</span>`;
    }
    
    // Create a unique ID for this mention element
    const mentionElementId = `mention-${userId}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Start with a loading state
    setTimeout(async () => {
      try {
        if (guildId && token) {
          // Use our new member find endpoint
          const response = await fetch(`/api/guilds/${guildId}/members/find`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, userId }),
          });
          
          let username = 'Unknown User';
          if (response.ok) {
            const memberData = await response.json();
            // Store username in cache - prefer nickname if available
            username = memberData.nick || 
                       memberData.user?.global_name || 
                       memberData.user?.username || 
                       'Unknown User';
          } 
          
          // Store in global cache
          window.userMentionCache[userId] = username;
          
          // Update all instances of this user mention
          const mentionElements = document.querySelectorAll(`[data-user-mention-id="${userId}"]`);
          mentionElements.forEach(element => {
            element.innerHTML = `@${username}`;
          });
        }
      } catch (error) {
        console.error(`Error fetching member data for ${userId}:`, error);
        // Still update with default value on error
        window.userMentionCache[userId] = 'Unknown User';
        const mentionElements = document.querySelectorAll(`[data-user-mention-id="${userId}"]`);
        mentionElements.forEach(element => {
          element.innerHTML = '@Unknown User';
        });
      }
    }, 0);
    
    // Return a placeholder that will be updated once the data is fetched
    return `<span class="mention" style="color: #00a8fc; background-color: rgba(88, 101, 242, 0.3); border-radius: 3px; padding: 0 2px;" id="${mentionElementId}" data-user-mention-id="${userId}">@Loading...</span>`;
  });
  
  // Handle standard markdown formatting
  return processedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')  // Italic
    .replace(/\_\_([^_]+)\_\_/g, '<u>$1</u>')  // Underline
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')  // Strikethrough
    .replace(/`([^`]+)`/g, '<code style="background-color:#2d2f34;padding:0 4px;border-radius:3px;font-family:monospace;">$1</code>')  // Inline code
    .replace(/@([a-zA-Z0-9_]+)/g, '<span style="color: #00a8fc;">@$1</span>')  // Simple text mentions (not Discord format)
    .replace(/\n/g, '<br />') // Handle newlines
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #00a8fc; text-decoration: none;">$1</a>');  // URLs
};

// Helper function to render stickers
const renderStickers = (stickerItems?: { id: string; name: string; format_type: number }[]) => {
  if (!stickerItems || stickerItems.length === 0) return null;
  
  return (
    <div style={{ marginTop: "8px" }}>
      {stickerItems.map((sticker) => {
        // Create a unique ID for this sticker element
        const stickerId = sticker.id;
        const elementId = `sticker-${stickerId}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Choose the appropriate URL based on format type
        let initialUrl = '';
        let isLottie = false;
        let isApng = false;
        
        // Format type 1: PNG, 2: APNG, 3: Lottie
        if (sticker.format_type === 3) {
          initialUrl = `https://cdn.discordapp.com/stickers/${stickerId}.json`;
          isLottie = true;
        } else {
          initialUrl = `https://cdn.discordapp.com/stickers/${stickerId}.png`;
          isApng = sticker.format_type === 2;
        }
        
        // Fetch sticker data to get more information
        const token = localStorage.getItem("token");
        const pathMatch = window.location.pathname.match(/\/app\/(\d+)(?:\/(\d+))?/);
        const guildId = pathMatch?.[1];
        
        if (token && guildId) {
          setTimeout(async () => {
            try {
              console.log(`Fetching sticker data for ID: ${stickerId} from guild ${guildId}`);
              
              const response = await fetch(`/api/guilds/${guildId}/stickers/${stickerId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
              });
              
              if (response.ok) {
                const stickerData = await response.json();
                console.log(`Sticker data received for ${stickerId}:`, stickerData);
                
                // Update the sticker with precise data from the API
                const stickerContainer = document.getElementById(`container-${elementId}`);
                if (stickerContainer) {
                  // Add description as a tooltip if available
                  if (stickerData.description) {
                    stickerContainer.setAttribute('title', stickerData.description);
                  }
                  
                  // Handle based on format type
                  const stickerElement = document.getElementById(elementId);
                  if (stickerElement) {
                    if (stickerData.format_type === 3 && stickerData.lottie_url) {
                      // For Lottie stickers, would need a Lottie player library
                      console.log(`Lottie sticker detected: ${sticker.name}`);
                    } else if (stickerElement instanceof HTMLImageElement) {
                      // For PNG/APNG stickers
                      const imgElement = stickerElement as HTMLImageElement;
                      imgElement.alt = stickerData.name || sticker.name;
                      imgElement.title = stickerData.description || stickerData.name || sticker.name;
                    }
                  }
                }
              }
            } catch (error) {
              console.error(`Error processing sticker ${stickerId}:`, error);
            }
          }, 0);
        }
        
        if (isLottie) {
          // For Lottie stickers, we'd ideally use a Lottie player
          // For now, show a placeholder with name
          return (
            <div 
              key={sticker.id} 
              id={`container-${elementId}`}
              style={{ 
                marginBottom: "8px",
                textAlign: "left" // Left aligned instead of center
              }}
            >
              <div style={{ 
                background: "#2f3136",
                padding: "8px", // Reduced padding
                borderRadius: "8px",
                maxWidth: "120px", // Reduced from 160px
                margin: "0" // Left aligned instead of auto margins
              }}>
                <div style={{ fontSize: "0.875rem", color: "#dbdee1" }}> {/* Smaller font */}
                  <span style={{ fontSize: "1.5rem" }}>🎬</span> {/* Smaller emoji */}
                  <div>Sticker: {sticker.name}</div>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div 
            key={sticker.id} 
            id={`container-${elementId}`}
            style={{ 
              marginBottom: "8px",
              display: "flex",
              justifyContent: "flex-start" // Align to left instead of center
            }}
            title={sticker.name}
          >
            <div style={{
              background: "transparent",
              borderRadius: "8px",
              maxWidth: "120px", // Reduced from 200px
              maxHeight: "120px", // Reduced from 200px
              display: "flex",
              justifyContent: "flex-start", // Align to left
              alignItems: "center"
            }}>
              <img
                id={elementId}
                src={initialUrl}
                alt={sticker.name}
                title={sticker.name}
                style={{
                  maxWidth: "120px", // Reduced from 200px
                  maxHeight: "120px", // Reduced from 200px
                  width: "auto",
                  height: "auto",
                  objectFit: "contain"
                }}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div style="padding: 12px; background: #2f3136; border-radius: 4px; color: #dbdee1; text-align: center; font-size: 0.875rem;">
                    <span style="font-size: 2rem">🏷️</span>
                    <div>Sticker: ${sticker.name}</div>
                  </div>`;
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to render attachments
const renderAttachments = (attachments: Attachment[]) => {
  if (!attachments || attachments.length === 0) return null;
  
  return (
    <div style={{ marginTop: "8px" }}>
      {attachments.map((attachment) => {
        // Handle image attachments
        if (attachment.content_type?.startsWith('image/')) {
          return (
            <div key={attachment.id} style={{ 
              borderRadius: "4px", 
              overflow: "hidden", 
              maxWidth: attachment.width && attachment.width > 400 ? "400px" : attachment.width ? `${attachment.width}px` : "400px",
              marginBottom: "8px" 
            }}>
              <Image
                src={attachment.url}
                alt={attachment.filename}
                width={attachment.width || 400}
                height={attachment.height || 300}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "4px"
                }}
                onError={(e) => {
                  // If Next.js Image fails, replace with regular img tag as fallback
                  const target = e.target as HTMLImageElement;
                  const img = document.createElement('img');
                  img.src = attachment.url;
                  img.alt = attachment.filename;
                  img.style.maxWidth = "100%";
                  img.style.height = "auto";
                  img.style.borderRadius = "4px";
                  target.parentNode?.replaceChild(img, target);
                }}
                unoptimized={true}
              />
              <div style={{ fontSize: "0.75rem", color: "#96989d", marginTop: "4px" }}>
                {attachment.filename}
              </div>
            </div>
          );
        }
        // Handle video attachments
        else if (attachment.content_type?.startsWith('video/')) {
          return (
            <div key={attachment.id} style={{ marginBottom: "8px" }}>
              <div className="discord-video-wrapper">
                <video 
                  controls
                  className="discord-video-player"
                  style={{
                    maxWidth: "240px", // Reduced from 400px to match other media
                    maxHeight: "180px", // Added height constraint
                    borderRadius: "4px",
                    backgroundColor: "#2f3136", // Discord dark theme color
                  }}
                >
                  <source src={attachment.url} type={attachment.content_type} />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#96989d", marginTop: "4px" }}>
                {attachment.filename}
              </div>
            </div>
          );
        }
        // Handle audio attachments
        else if (attachment.content_type?.startsWith('audio/')) {
          return (
            <div key={attachment.id} style={{ marginBottom: "8px" }}>
              <audio 
                controls
                style={{
                  maxWidth: "240px", // Reduced from 400px to match other media
                }}
              >
                <source src={attachment.url} type={attachment.content_type} />
                Your browser does not support the audio tag.
              </audio>
              <div style={{ fontSize: "0.75rem", color: "#96989d", marginTop: "4px" }}>
                {attachment.filename}
              </div>
            </div>
          );
        }
        // Handle other file types
        else {
          return (
            <div key={attachment.id} style={{ 
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              padding: "8px",
              background: "rgba(0,0,0,0.1)",
              borderRadius: "4px",
              maxWidth: "240px" // Reduced from 400px to match other media
            }}>
              <div style={{ marginRight: "8px" }}>
                <Image
                  src="/file.svg"
                  alt="File icon"
                  width={24}
                  height={24}
                />
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ 
                  whiteSpace: "nowrap", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis",
                  fontSize: "0.875rem",
                  color: "#00a8fc"
                }}>
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: "#00a8fc", 
                      textDecoration: "none" 
                    }}
                  >
                    {attachment.filename}
                  </a>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#96989d" }}>
                  {Math.round(attachment.size / 1024)} KB
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};



// Helper function to render embeds
const renderEmbeds = (embeds: Embed[]) => {
  if (!embeds || embeds.length === 0) return null;
  
  return (
    <div style={{ marginTop: "8px" }}>
      {embeds.map((embed, index) => {
        // Function to extract media URLs from any property in the embed
        const getMediaUrl = () => {
          // Check direct url property
          if (embed.url && /\.(gif|png|jpg|jpeg|webp)(\?.*)?$/i.test(embed.url)) {
            return embed.url;
          }
          
          // Check description for CDN links
          if (embed.description) {
            const cdnMatch = embed.description.match(/https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)(\?\S*)?/i);
            if (cdnMatch) return cdnMatch[0];
          }
          
          // Check if any field values contain CDN links
          if (embed.fields && embed.fields.length > 0) {
            for (const field of embed.fields) {
              if (field.value) {
                const cdnMatch = field.value.match(/https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)(\?\S*)?/i);
                if (cdnMatch) return cdnMatch[0];
              }
            }
          }
          
          // No direct media URL found
          return null;
        };
        
        // Special handling for direct image embeds (type: "image") or any embed with media content
        const mediaUrl = (embed.type === 'image' && embed.url) ? embed.url : getMediaUrl();
        if (mediaUrl) {
          const isGif = mediaUrl.toLowerCase().endsWith('.gif');
          
          return (
            <div 
              key={index} 
              style={{ 
                borderRadius: "4px",
                overflow: "hidden",
                maxWidth: "300px",
                marginBottom: "8px",
                position: "relative"
              }}
            >
              {isGif ? (
                <>
                  <video 
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      maxWidth: "300px", 
                      maxHeight: "300px",
                      width: "auto", 
                      height: "auto",
                      display: "block",
                      borderRadius: "4px"
                    }}
                  >
                    <source src={mediaUrl} type="video/gif" />
                    <img
                      src={mediaUrl}
                      alt="Embedded GIF"
                      style={{
                        maxWidth: "300px",
                        maxHeight: "300px",
                        width: "auto",
                        height: "auto",
                        borderRadius: "4px",
                        display: "block"
                      }}
                      loading="lazy"
                    />
                  </video>
                  <div style={{
                    position: "absolute",
                    right: "8px",
                    bottom: "8px",
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    fontSize: "10px",
                    padding: "2px 4px",
                    borderRadius: "2px",
                    opacity: 0.7
                  }}>
                    GIF
                  </div>
                </>
              ) : (
                <img
                  src={mediaUrl}
                  alt="Embedded image"
                  style={{
                    maxWidth: "300px",
                    maxHeight: "300px",
                    width: "auto",
                    height: "auto",
                    borderRadius: "4px",
                    display: "block"
                  }}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<div style="padding: 8px; background: rgba(0,0,0,0.1); border-radius: 4px;"><a href="${mediaUrl}" target="_blank" rel="noopener noreferrer" style="color: #00a8fc; text-decoration: none;">Unable to load image</a></div>`;
                  }}
                />
              )}
              <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                <a href={mediaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#96989d", textDecoration: "none" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: "middle", marginRight: "4px" }}>
                    <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Open original
                </a>
              </div>
            </div>
          );
        }
        
        // Special handling for Tenor GIFVs and other video embeds
        if (embed.type === 'gifv' && embed.video && (
          embed.provider?.name === 'Tenor' || 
          embed.url?.includes('tenor.com')
        )) {
          // Render just the video without the embed UI - like a GIF
          return (
            <div 
              key={index} 
              style={{ 
                borderRadius: "4px",
                overflow: "hidden",
                maxWidth: "240px", // Reduced from 300px
                marginBottom: "8px",
                backgroundColor: "#000",
                position: "relative"
              }}
            >
              <video 
                autoPlay
                loop
                muted
                playsInline
                style={{
                  maxWidth: "240px", // Reduced from 300px
                  maxHeight: "180px", // Reduced from 300px
                  width: "auto", 
                  height: "auto",
                  display: "block"
                }}
                poster={embed.thumbnail?.url}
              >
                <source src={embed.video.url} type="video/mp4" />
                {/* Fallback to image if video fails */}
                {embed.thumbnail && (
                  <img 
                    src={embed.thumbnail.url}
                    alt="Tenor GIF"
                    style={{
                      maxWidth: "300px",
                      maxHeight: "300px",
                      width: "auto",
                      height: "auto",
                    }}
                  />
                )}
              </video>
              
              {/* Small attribution badge */}
              <div style={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                fontSize: "10px",
                padding: "2px 4px",
                borderRadius: "2px",
                opacity: 0.7
              }}>
                GIF
              </div>
            </div>
          );
        }
        
        // Standard embed rendering for other types
        const borderColor = embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : "#747f8d";
        
        return (
          <div 
            key={index} 
            style={{ 
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: "4px",
              background: "#2f3136",
              padding: "8px 16px",
              marginBottom: "8px",
              maxWidth: "520px"
            }}
          >
            {/* Embed title */}
            {embed.title && (
              <div 
                style={{ 
                  color: "#ffffff", 
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: "8px"
                }}
                dangerouslySetInnerHTML={{ 
                  __html: parseDiscordMarkdown(embed.title)
                }}
              />
            )}
            
            {/* Embed description */}
            {embed.description && (
              <div 
                style={{ 
                  color: "#dbdee1", 
                  fontSize: "0.9375rem",
                  marginBottom: "8px",
                  whiteSpace: "pre-wrap"
                }}
                dangerouslySetInnerHTML={{ 
                  __html: parseDiscordMarkdown(embed.description)
                }}
              />
            )}
            
            {/* Embed fields */}
            {embed.fields && embed.fields.length > 0 && (
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "8px",
                marginBottom: "8px"
              }}>
                {embed.fields.map((field, fieldIndex) => {
                  // Check if field contains a Discord CDN link
                  const cdnMatch = field.value?.match(/https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)(\?\S*)?/i);
                  
                  return (
                    <div 
                      key={fieldIndex}
                      style={{
                        gridColumn: field.inline ? "span 1" : "1 / -1",
                      }}
                    >
                      <div style={{ 
                        color: "#ffffff", 
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        marginBottom: "2px"
                      }}>
                        {field.name}
                      </div>
                      <div style={{ 
                        color: "#dbdee1", 
                        fontSize: "0.875rem",
                      }}>
                        {cdnMatch ? (
                          <div>
                            {field.value.replace(cdnMatch[0], '')} {/* Show text without the URL */}
                            {cdnMatch[1].toLowerCase() === 'gif' ? (
                              <div style={{ marginTop: "4px" }}>
                                <video 
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{
                                    maxWidth: "300px", 
                                    maxHeight: "300px",
                                    width: "auto", 
                                    height: "auto",
                                    display: "block",
                                    borderRadius: "4px"
                                  }}
                                >
                                  <source src={cdnMatch[0]} type="video/gif" />
                                  <img
                                    src={cdnMatch[0]}
                                    alt="Embedded GIF"
                                    style={{
                                      maxWidth: "300px",
                                      maxHeight: "300px",
                                      width: "auto",
                                      height: "auto",
                                      borderRadius: "4px",
                                      display: "block"
                                    }}
                                    loading="lazy"
                                  />
                                </video>
                              </div>
                            ) : (
                              <div style={{ marginTop: "4px" }}>
                                <img
                                  src={cdnMatch[0]}
                                  alt="Embedded image"
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "300px",
                                    width: "auto",
                                    height: "auto",
                                    borderRadius: "4px",
                                    display: "block"
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          field.value
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Embed image */}
            {embed.image && (
              <div style={{ 
                marginTop: "8px", 
                borderRadius: "4px",
                overflow: "hidden",
                maxWidth: "400px"
              }}>
                <Image
                  src={embed.image.url}
                  alt="Embed image"
                  width={embed.image.width || 400}
                  height={embed.image.height || 300}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "4px"
                  }}
                  onError={(e) => {
                    // If Next.js Image fails, replace with regular img tag as fallback
                    const target = e.target as HTMLImageElement;
                    const img = document.createElement('img');
                    img.src = embed.image!.url;
                    img.alt = "Embed image";
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.borderRadius = "4px";
                    target.parentNode?.replaceChild(img, target);
                  }}
                  unoptimized={true}
                />
              </div>
            )}
            
            {/* Embed video - not for gifv types as those are handled separately */}
            {embed.video && embed.type !== 'gifv' && (
              <div style={{ 
                marginTop: "8px", 
                borderRadius: "4px",
                overflow: "hidden",
                maxWidth: embed.video.width ? `${embed.video.width}px` : "400px"
              }}>
                <video 
                  controls
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    display: "block"
                  }}
                  poster={embed.thumbnail?.url}
                >
                  <source src={embed.video.url} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                {embed.provider && (
                  <div style={{ 
                    marginTop: "4px", 
                    fontSize: "0.75rem",
                    color: "#96989d" 
                  }}>
                    {embed.provider.name}
                  </div>
                )}
              </div>
            )}
            
            {/* Embed footer */}
            {embed.footer && (
              <div style={{ 
                marginTop: "8px",
                color: "#96989d",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center"
              }}>
                {embed.footer?.icon_url && (
                  <Image
                    src={embed.footer.icon_url}
                    alt="Footer icon"
                    width={20}
                    height={20}
                    style={{
                      borderRadius: "50%",
                      marginRight: "8px"
                    }}
                    onError={(e) => {
                      // If Next.js Image fails, replace with regular img tag
                      if (embed.footer && embed.footer.icon_url) {
                        const target = e.target as HTMLImageElement;
                        const img = document.createElement('img');
                        img.src = embed.footer.icon_url;
                        img.alt = "Footer icon";
                        img.style.width = "20px";
                        img.style.height = "20px";
                        img.style.borderRadius = "50%";
                        img.style.marginRight = "8px";
                        target.parentNode?.replaceChild(img, target);
                      }
                    }}
                    unoptimized={true}
                  />
                )}
                {embed.footer.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// No need for custom scrollbar styles anymore, we'll use inline styles

export default function ChatArea() {
  // Using React's useEffect and useState to handle client-side URL parsing
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [channelName, setChannelName] = useState(""); // State for the channel name
  const [isSending, setIsSending] = useState(false); // State to track message sending
  
  // Ref for the messages container to auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to send messages to the Discord API
  const sendMessage = async (content: string) => {
    if (!guildId || !channelId || !content || isSending) return;
    
    setIsSending(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("You need to be logged in to send messages");
      setIsSending(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/guilds/${guildId}/channels/${channelId}/chats/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        
        if (response.status === 403) {
          alert("You don't have permission to send messages in this channel");
        } else if (response.status === 429) {
          alert("You're sending messages too quickly. Please wait a moment.");
        } else {
          alert(`Error sending message: ${errorData.error || response.statusText}`);
        }
        
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // We don't need to manually add the message to the UI
      // The WebSocket will pick up the message automatically
      
      // Still scroll to bottom to ensure good UX
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Move the URL parsing to useEffect to ensure it only runs on the client
  useEffect(() => {
    const pathMatch = window.location.pathname.match(/\/app\/(\d+)(?:\/(\d+))?/);
    setGuildId(pathMatch?.[1] || "");
    setChannelId(pathMatch?.[2] || "");
  }, []);
  
    // Fetch channel details to get the channel name
  useEffect(() => {
    if (guildId && channelId) {
      
      // Try to get the channel name from the API
      const token = localStorage.getItem("token");
      
      // Fetch all channels for the guild
      fetch(`/api/guilds/${guildId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // The API returns a structured object with categories and channels
        let foundChannel = false;
        
        // Check all categories and their text/voice channels
        if (Array.isArray(data)) {
          for (const group of data) {
            
            // Check text channels in this category
            if (Array.isArray(group.text_channels)) {
              const channel = group.text_channels.find((ch: any) => ch.id === channelId);
              if (channel && channel.name) {
                setChannelName(channel.name);
                foundChannel = true;
                break;
              }
            }
            
            // Check voice channels in this category
            if (!foundChannel && Array.isArray(group.voice_channels)) {
              const channel = group.voice_channels.find((ch: any) => ch.id === channelId);
              if (channel && channel.name) {
                setChannelName(channel.name);
                foundChannel = true;
                break;
              }
            }
          }
        }
        
        // If we didn't find the channel in the structured data
        if (!foundChannel) {
          // Try direct API call as a fallback
          fetch(`https://discord.com/api/v10/channels/${channelId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bot ${token}`,
              "Content-Type": "application/json",
            },
          })
          .then(response => response.json())
          .then(channelData => {
            if (channelData && channelData.name) {
              setChannelName(channelData.name);
            } else {
              setChannelName(`channel-${channelId}`);
            }
          })
          .catch(error => {
            console.error("Error with direct API call:", error);
            setChannelName(`channel-${channelId}`);
          });
        }
      })
      .catch(error => {
        console.error("Error fetching channel details:", error);
        setChannelName(`channel-${channelId}`);
      });
    } else {
      setChannelName(""); // Reset when no channel is selected
    }
  }, [guildId, channelId]);

  // Fetch chats in useEffect to ensure it only runs on the client
  useEffect(() => {
    if (guildId && channelId) {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      fetch(`/api/guilds/${guildId}/channels/${channelId}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          // Sort messages by timestamp (oldest first)
          const sortedMessages = [...data].sort((a, b) => 
            parseInt(a.id) - parseInt(b.id)
          );
          setMessages(sortedMessages);
        } else {
          // If data is not in expected format
          console.warn("API response is not in the expected format:", data);
          setMessages([]);
        }
      })
      .catch(error => {
        console.error("Error fetching messages:", error);
        setMessages([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      // Reset messages when no channel is selected
      setMessages([]);
    }
  }, [guildId, channelId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listen for real-time messages from WebSocket
  useEffect(() => {
    // Handler for the custom discord-message event
    const handleDiscordMessage = (event: any) => {
      const newMessage = event.detail;
      
      // Only add the message if it belongs to the current channel
      if (newMessage && newMessage.channel_id === channelId) {
        console.log("Adding new WebSocket message to chat:", newMessage);
        
        // Add the new message to the messages array
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    };
    
    // Add the event listener
    window.addEventListener("discord-message", handleDiscordMessage);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("discord-message", handleDiscordMessage);
    };
  }, [channelId]); // Re-add the listener if the channelId changes
  
  return (
    <>
      <div
        id="chatArea"
        style={{
        position: "fixed",
        top: 0,
        left: "312px", /* 72px (server list) + 240px (channel list) */
        right: "240px", /* Member list width */
        height: "100vh",
        background: "#313338",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          height: "48px",
          borderBottom: "1px solid #232428",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {channelId ? `# ${channelName || 'loading...'}` : "Discord for Bots"}
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: !channelId || isLoading || messages.length === 0 ? "center" : "flex-start",
          alignItems: !channelId || isLoading || messages.length === 0 ? "center" : "stretch",
          overflowY: "auto",
          maxHeight: "calc(100vh - 48px - 76px)", /* Subtract header height and message input height */
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "#202225 transparent",
        }}
      >
        {!channelId ? (
          <div
            style={{
              color: "#96989d",
              fontSize: "16px",
              textAlign: "center",
              padding: "20px",
              background: "#383a40",
              borderRadius: "8px",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            Please select a channel to start chatting
          </div>
        ) : isLoading ? (
          <div
            style={{
              color: "#96989d",
              fontSize: "16px",
              textAlign: "center",
              padding: "20px",
              background: "#383a40",
              borderRadius: "8px",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              color: "#96989d",
              fontSize: "16px",
              textAlign: "center",
              padding: "20px",
              background: "#383a40",
              borderRadius: "8px",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            No messages in this channel. Be the first to say something!
          </div>
        ) : (
          // Only render messages when they exist
          messages.map((message: Message) => (
          <div
            key={message.id}
            style={{
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: message.author.bot ? "rgba(78, 80, 88, 0.1)" : "transparent",
            }}
          >
            {/* Reply reference - styled to match Discord screenshot */}
            {message.referenced_message && (
              <>
                <div 
                  style={{
                    display: "flex",
                    marginBottom: "0px",
                    paddingLeft: "0px"
                  }}
                >
                  <div style={{ 
                    paddingRight: "7px",
                    paddingTop: "2px",
                  }}>
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#4f545c" }}>
                      <path d="M0.5 3L6 8.5L11.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div 
                    style={{ 
                      borderLeft: "2px solid #4f545c", 
                      paddingLeft: "8px",
                      color: "#b5bac1",
                      fontSize: "0.8125rem",
                      marginBottom: "2px"
                    }}
                  >
                    <span style={{ 
                      color: "#b5bac1", 
                      fontWeight: "400",
                    }}>
                      <span style={{
                        color: "#00a8fc",
                        fontWeight: "500",
                      }}>
                        @{message.referenced_message.author.username}
                      </span>
                      {' '}<span dangerouslySetInnerHTML={{ __html: parseDiscordMarkdown(message.referenced_message.content) }} />
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {/* Main message content */}
            <div
              style={{
                display: "flex",
                gap: "15px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#36393f",
                  position: "relative",
                  marginTop: "2px"
                }}
              >
                <Image
                  src={`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp`}
                  alt={message.author.username || message.author.global_name || "User"}
                  width={40}
                  height={40}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    // If avatar loading fails, use a default avatar
                    const target = e.target as HTMLImageElement;
                    target.src = "/defaultServerIcon.png";
                  }}
                  unoptimized={true}
                />
              </div>
              <div style={{ flex: 1, maxWidth: "calc(100% - 56px)" }}>
                <div style={{ marginBottom: "2px", display: "flex", alignItems: "baseline" }}>
                  <span
                    style={{
                      color: "#f2f3f5",
                      fontWeight: "500",
                      marginRight: "6px",
                      fontSize: "1rem"
                    }}
                  >
                    {message.author.global_name || message.author.username}
                  </span>
                  {message.author.bot && (
                    <span style={{ 
                      background: "#5865f2",
                      color: "white", 
                      fontSize: "0.65rem", 
                      fontWeight: "500",
                      padding: "0px 4px",
                      borderRadius: "3px",
                      marginRight: "6px",
                      textTransform: "uppercase"
                    }}>
                      Bot
                    </span>
                  )}
                  <span style={{ color: "#b5bac1", fontSize: "0.75rem" }}>
                    {message.timestamp && new Date(message.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{ color: "#dbdee1", fontSize: "0.9375rem" }}>
                  {/* If it's a URL-only message that has embeds, don't show the URL to prevent duplication */}
                  {message.content ? 
                    (() => {
                      // URL-only message detection for common media types - enhanced for Discord attachments
                      const isUrlOnly = (
                        message.embeds && 
                        message.embeds.length > 0 && 
                        (
                          /^https?:\/\/(?:cdn\.discordapp\.com\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)|media\.discordapp\.net\/attachments\/\d+\/\d+\/[\w-]+\.(gif|png|jpg|jpeg|webp)|\S+\.(gif|png|jpg|jpeg|webp))(\?\S*)?$/i.test(message.content.trim()) ||
                          /^https:\/\/tenor\.com\/view\/[\w\-%']+-gif-\d+$/i.test(message.content.trim()) ||
                          /^https:\/\/giphy\.com\/gifs\/[\w\-%']+-\w+$/i.test(message.content.trim())
                        )
                      );
                      
                      // If it's a URL-only message with embeds, don't show the content to avoid duplication
                      return !isUrlOnly ? 
                        <div dangerouslySetInnerHTML={{ __html: parseDiscordMarkdown(message.content) }} /> :
                        null;
                    })() : 
                    null
                  }
                  {renderAttachments(message.attachments)}
                  {renderStickers(message.sticker_items)}
                  {renderEmbeds(message.embeds)}
                </div>
              </div>
            </div>
          </div>
        ))
        )}
        {/* Invisible element for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input - only show when a channel is selected */}
      {channelId && (
        <div
          style={{
            margin: "0 16px 24px 16px",
          }}
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const messageInput = e.currentTarget.querySelector('input') as HTMLInputElement;
              if (messageInput && messageInput.value.trim()) {
                sendMessage(messageInput.value);
                messageInput.value = '';
              }
            }}
            style={{
              borderRadius: "8px",
              background: "#383a40",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              position: "relative",
              border: `1px solid ${isSending ? "#5865f2" : "transparent"}`,
              transition: "border-color 0.2s ease",
            }}
          >
            {isSending && (
              <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                height: "2px",
                background: "#5865f2",
                animation: "progress 2s infinite linear",
                width: "50%",
                borderTopLeftRadius: "8px",
              }} />
            )}
            <input 
              type="text"
              placeholder={isSending ? "Sending..." : `Message #${channelName || 'channel'}`}
              disabled={isSending}
              autoComplete="off"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "0.9375rem",
                width: "100%",
                padding: "0",
                opacity: isSending ? 0.7 : 1,
              }}
              onKeyDown={(e) => {
                // Submit on Enter key press (without shift key for newline)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const content = (e.target as HTMLInputElement).value.trim();
                  if (content) {
                    sendMessage(content);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isSending}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: isSending ? "not-allowed" : "pointer",
                padding: "0 0 0 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#96989d",
                transition: "color 0.2s ease",
              }}
              aria-label="Send message"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ color: isSending ? "#5865f2" : "#96989d" }}
              >
                <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/>
                <path d="M6 12h16"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
    </>
  );
}
