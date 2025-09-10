"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// CSS will be applied using inline styles

// Define server interface
interface Server {
  id: string;
  name: string;
  iconUrl: string;
}

export default function ServerList() {
  const [servers, setServers] = useState<Server[]>([]);
  const [activeServerId, setActiveServerId] = useState<string>("");
  
  useEffect(() => {
    const fetchServers = async () => {
      try {
        // Only run this in the browser
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("token");
          
          // Fetch servers with retry logic for rate limits
          const response = await fetch("/api/guilds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          
          if (!response.ok) {
            // Handle rate limiting specially
            if (response.status === 429) {
              const data = await response.json();
              const retryAfter = data.retryAfter ? parseInt(data.retryAfter) * 1000 : 5000;
              
              console.log(`Rate limited by Discord API. Retrying in ${retryAfter/1000} seconds...`);
              
              // Set a timer to retry after the specified delay
              setTimeout(fetchServers, retryAfter);
              return;
            }
            
            console.error(`Error fetching servers: ${response.status}`);
            setServers([]);
            return;
          }
          
          const data = await response.json();
          
          // Make sure data is an array before setting it
          if (Array.isArray(data)) {
            setServers(data);
          } else if (data && data.error) {
            console.error(`API error: ${data.error}`);
            setServers([]);
          } else {
            console.error('Unexpected API response format');
            setServers([]);
          }
        }
      } catch (e) {
        console.error("Error fetching servers:", e);
        setServers([]);
      }
    };
    
    fetchServers();
    
    // Extract server ID from URL to determine active server
    const path = window.location.pathname;
    const match = path.match(/\/app\/([^\/]+)/);
    if (match && match[1]) {
      setActiveServerId(match[1]);
    }
  }, []);

  return (
    <>
      <div
        id="serverList"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "72px",
          background: "#1e1f22",
          borderRadius: "0",
          margin: "0",
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          overflowY: "auto",
          zIndex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: "#202225 transparent",
          msOverflowStyle: "none",
        }}
        className="hide-scrollbar"
      >
        {/* Home Button */}
        <div style={{ marginBottom: "8px" }}>
          <Link href="/app">
            <div
              style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#36393f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              cursor: "pointer",
              }}
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 72 72"
                fill="#4f545c"
                >
                <path d="M 36 10 C 34.861 10 33.722922 10.386609 32.794922 11.162109 L 11.517578 28.941406 C 10.052578 30.165406 9.5519375 32.270219 10.460938 33.949219 C 11.219708 35.3497 12.603889 36.065273 14 36.066406 L 14 50 C 14 54.418 17.582 58 22 58 L 50 58 C 54.418 58 58 54.418 58 50 L 58 36.078125 C 59.17234 36.077559 60.334392 35.56667 61.126953 34.574219 C 62.503953 32.850219 62.112922 30.303672 60.419922 28.888672 L 58 26.867188 L 58 16.667969 C 58 15.194969 56.805984 14 55.333984 14 L 52.667969 14 C 51.194969 14 50 15.194969 50 16.667969 L 50 20.181641 L 39.205078 11.162109 C 38.277078 10.386609 37.139 10 36 10 z M 36 19.212891 C 36.22775 19.212891 36.455125 19.290312 36.640625 19.445312 L 50 30.607422 L 50 49.5 C 50 49.776 49.776 50 49.5 50 L 42 50 L 42 38 C 42 36.895 41.105 36 40 36 L 32 36 C 30.895 36 30 36.895 30 38 L 30 50 L 22.5 50 C 22.224 50 22 49.776 22 49.5 L 22 30.607422 L 35.359375 19.445312 C 35.544875 19.290313 35.77225 19.212891 36 19.212891 z"></path>
                </svg>
            </div>
          </Link>
        </div>

        {/* Server divider */}
        <div
          style={{
            width: "32px",
            height: "2px",
            background: "#36393f",
            borderRadius: "1px",
            margin: "4px 0",
          }}
        />

        {/* Server icons */}
        {Array.isArray(servers) && servers.map((server) => (
          <div
            key={server.id}
            style={{
              marginBottom: "8px",
            }}
          >
            <Link href={`/app/${server.id}`}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: server.id === activeServerId ? "16px" : "50%", // Circle for inactive, rounded square for active
                  background: "#36393f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-radius 0.2s ease",
                }}
              >
                <Image
                  src={server.iconUrl || "/defaultServerIcon.png"}
                  alt={server.name}
                  width={48}
                  height={48}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  unoptimized={!server.iconUrl?.includes("cdn.discordapp.com")}
                />
                {server.id === activeServerId && (
                  <div
                    style={{
                      position: "absolute",
                      left: "-12px",
                      width: "8px",
                      height: "40px",
                      background: "white",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
