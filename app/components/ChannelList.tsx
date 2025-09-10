"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Add CSS styles for channel links and scrollbar
const channelStyles = `
  .channel-link:hover {
    background-color: #36393f !important;
    color: #dcddde !important;
  }

  .channel-list-container {
    scrollbar-width: thin;
    scrollbar-color: #202225 transparent;
  }
  .channel-list-container::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }
  .channel-list-container::-webkit-scrollbar-thumb {
    background-color: #202225;
    border-radius: 4px;
    min-height: 24px;
  }
  .channel-list-container::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px;
  }
  .channel-list-container:hover::-webkit-scrollbar-thumb {
    background-color: #2a2c30;
  }
`;

// Define types for channel data
interface Channel {
  id: string;
  name: string;
  type: number;
  topic?: string | null;
  position: number;
  parent_id?: string | null;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rtc_region?: string | null;
  permission_overwrites?: any[];
}

interface CategoryGroup {
  category: {
    id: string | null;
    name: string;
  };
  text_channels: Channel[];
  voice_channels: Channel[];
}

// Helper function to truncate channel names
const truncateChannelName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength)}..`;
};

export default function ChannelList() {
  const [guildId, setGuildId] = useState<string>("");
  const [serverName, setServerName] = useState<string>("Bot Development");
  const [channels, setChannels] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    // Extract the guild ID (segment after /app/)
    const extractGuildId = () => {
      // Match pattern: /app/{guildId}/ or /app/{guildId}
      const appPathRegex = /\/app\/([^/]+)/;
      const match = pathname.match(appPathRegex);

      if (match && match[1]) {
        return match[1]; // Return the captured group (guildId)
      }
      return "";
    };

    const id = extractGuildId();
    setGuildId(id);
    console.log("Guild ID:", id);
    
    // Fetch guild channels if we have a valid guild ID
    if (id && typeof window !== 'undefined') {
      const fetchGuildChannels = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token") || "";
          console.log(`Fetching channels for guild ID: ${id}`);
          // Use POST with token in the request body for security
          const response = await fetch(`/api/guilds/${id}/channels`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              // Add a debug header to track the request
              "X-Debug-Info": "ChannelList-Component" 
            },
            body: JSON.stringify({ token }),
          });
          
          if (!response.ok) {
            console.error(`Error fetching guild channels: ${response.status} ${response.statusText}`);
            // Try to get more error details
            try {
              const errorData = await response.json();
              console.error("Error details:", errorData);
              setError(`Failed to load channels: ${errorData.error || response.statusText}`);
            } catch (e) {
              console.error("Couldn't parse error response");
              setError(`Failed to load channels: ${response.statusText}`);
            }
            return;
          }
          
          const channelsData = await response.json();
          console.log("Guild channels data:", channelsData);
          
          // Set the channel data directly in the expected format
          if (Array.isArray(channelsData) && channelsData.length > 0) {
            // The API is now returning data in the exact format we need
            setChannels(channelsData);
          }
          
          // Also fetch guild info to get server name
          const guildResponse = await fetch(`/api/guilds/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          
          if (guildResponse.ok) {
            const guildData = await guildResponse.json();
            if (guildData && guildData.name) {
              setServerName(guildData.name);
            }
          }
          
        } catch (error: any) {
          console.error("Error fetching guild channels:", error);
          setError(`Failed to load channels: ${error.message || "Unknown error"}`);
        } finally {
          setLoading(false);
        }
      };
      
      fetchGuildChannels();
    }
  }, [pathname]);
  return (
    <div
      id="channelList"
      className="channel-list-container"
      style={{
        position: "fixed",
        top: 0,
        left: "72px",
        height: "100vh",
        width: "240px",
        background: "#2b2d31",
        margin: "0",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        zIndex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: "#202225 transparent",
      }}
    >
      {/* Add style tag for CSS */}
      <style jsx global>{channelStyles}</style>
      {/* Server name header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #1e1f22",
          fontWeight: "bold",
          fontSize: "16px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {loading ? "Loading..." : guildId ? serverName : "Discord for Bots"}
      </div>

      {!guildId ? (
        // Show this message when no server is selected (we're on /app)
        <div
          style={{
            padding: "20px 16px",
            color: "#96989d",
            fontSize: "14px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            marginTop: "40px",
          }}
        >
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>👈</div>
          <div>Please select a server from the left sidebar</div>
        </div>
      ) : error ? (
        // Show error message when channel loading fails
        <div
          style={{
            padding: "20px 16px",
            color: "#f04747",
            fontSize: "14px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            marginTop: "40px",
          }}
        >
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>⚠️</div>
          <div>{error}</div>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              // Trigger a reload by changing the key on the component
              const token = localStorage.getItem("token") || "";
              fetch(`/api/guilds/${guildId}/channels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              })
                .then(res => {
                  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
                  return res.json();
                })
                .then(data => {
                  setChannels(data);
                  setLoading(false);
                })
                .catch(err => {
                  setError(`Failed to load channels: ${err.message}`);
                  setLoading(false);
                });
            }}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#5865f2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Retry
          </button>
        </div>
      ) : loading && channels.length === 0 ? (
        // Show loading animation when first loading channels
        <div
          style={{
            padding: "20px 16px",
            color: "#96989d",
            fontSize: "14px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            marginTop: "40px",
          }}
        >
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>⏳</div>
          <div>Loading channels...</div>
        </div>
      ) : channels.length > 0 ? (
        // Show channels when a server is selected and channels loaded successfully
        <div>
          {channels.map((categoryGroup: CategoryGroup) => (
            <div key={categoryGroup.category?.id || "no-category"}>
              <div
                style={{
                  padding: "16px 8px 0 16px",
                  color: "#96989d",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {categoryGroup.category?.name || "No Category"}
              </div>
              
              {/* Text Channels */}
              {categoryGroup.text_channels.map((channel: Channel) => (
                <a
                  key={channel.id}
                  href={`/app/${guildId}/${channel.id}`}
                  className="channel-link"
                  style={{
                    padding: "6px 8px 6px 20px",
                    color: "#96989d",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginLeft: "8px",
                    borderRadius: "4px",
                    marginRight: "8px",
                    textDecoration: "none",
                    transition: "background-color 0.2s",
                    backgroundColor: pathname.includes(`/${channel.id}`) ? "#393c43" : "transparent",
                  }}
                >
                  <svg className="w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M214.7 .7c17.3 3.7 28.3 20.7 24.6 38l-19.1 89.3 126.5 0 22-102.7C372.4 8 389.4-3 406.7 .7s28.3 20.7 24.6 38L412.2 128 480 128c17.7 0 32 14.3 32 32s-14.3 32-32 32l-81.6 0-27.4 128 67.8 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-81.6 0-22 102.7c-3.7 17.3-20.7 28.3-38 24.6s-28.3-20.7-24.6-38l19.1-89.3-126.5 0-22 102.7c-3.7 17.3-20.7 28.3-38 24.6s-28.3-20.7-24.6-38L99.8 384 32 384c-17.7 0-32-14.3-32-32s14.3-32 32-32l81.6 0 27.4-128-67.8 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l81.6 0 22-102.7C180.4 8 197.4-3 214.7 .7zM206.4 192l-27.4 128 126.5 0 27.4-128-126.5 0z"/>
                  </svg> <span title={channel.name.length > 20 ? channel.name : ""}>{truncateChannelName(channel.name)}</span>
                </a>
              ))}
              
              {/* Voice Channels */}
              {categoryGroup.voice_channels.map((channel: Channel) => (
                <div
                  key={channel.id}
                  style={{
                    padding: "6px 8px 6px 20px",
                    color: "#96989d",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginLeft: "8px",
                    borderRadius: "4px",
                    marginRight: "8px",
                    opacity: "0.8",
                  }}
                >
                  <svg className="w-[19px] h-[19px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 6.037c0-1.724-1.978-2.665-3.28-1.562L5.638 7.933H4c-1.105 0-2 .91-2 2.034v4.066c0 1.123.895 2.034 2 2.034h1.638l4.082 3.458c1.302 1.104 3.28.162 3.28-1.562V6.037Z"/>
                    <path fillRule="evenodd" d="M14.786 7.658a.988.988 0 0 1 1.414-.014A6.135 6.135 0 0 1 18 12c0 1.662-.655 3.17-1.715 4.27a.989.989 0 0 1-1.414.014 1.029 1.029 0 0 1-.014-1.437A4.085 4.085 0 0 0 16 12a4.085 4.085 0 0 0-1.2-2.904 1.029 1.029 0 0 1-.014-1.438Z" clipRule="evenodd"/>
                    <path fillRule="evenodd" d="M17.657 4.811a.988.988 0 0 1 1.414 0A10.224 10.224 0 0 1 22 12c0 2.807-1.12 5.35-2.929 7.189a.988.988 0 0 1-1.414 0 1.029 1.029 0 0 1 0-1.438A8.173 8.173 0 0 0 20 12a8.173 8.173 0 0 0-2.343-5.751 1.029 1.029 0 0 1 0-1.438Z" clipRule="evenodd"/>
                  </svg> <span title={channel.name.length > 20 ? channel.name : ""}>{truncateChannelName(channel.name)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        // Show simple text message when no channels are loaded
        <div
          style={{
            padding: "20px 16px",
            color: "#f04747",
            fontSize: "14px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            marginTop: "40px",
          }}
        >
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>⚠️</div>
          <div>Failed to load channel list</div>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              const token = localStorage.getItem("token") || "";
              fetch(`/api/guilds/${guildId}/channels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              })
                .then(res => {
                  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
                  return res.json();
                })
                .then(data => {
                  setChannels(data);
                  setLoading(false);
                })
                .catch(err => {
                  setError(`Failed to load channels: ${err.message}`);
                  setLoading(false);
                });
            }}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#5865f2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
