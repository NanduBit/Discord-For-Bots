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
          
          // Simple fetch without retry since server handles caching
          const response = await fetch("/api/guilds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          
          if (!response.ok) {
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
              <Image src="/next.svg" alt="Home" width={24} height={24} />
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
