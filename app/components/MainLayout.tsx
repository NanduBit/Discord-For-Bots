"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import ServerList from "./ServerList";
import ChannelList from "./ChannelList";
import MemberList from "./MemberList";
import DiscordListener from "./websocket";
import { useDiscordContext } from "../context/DiscordContext";
import "../styles/mobile.css";

// Mobile-compatible layout with reliable sidebar navigation
export default function MainLayout({ children }: { children: React.ReactNode }) {
  // Sidebar toggles for mobile
  const [showServer, setShowServer] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Access Discord context for server and channel data
  const { serverName, channels } = useDiscordContext();
  
  const pathname = usePathname();
  const params = useParams();
  const guildId = params?.guildId as string;
  const channelId = params?.channelId as string;
  
  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-show channel list on desktop
      if (!mobile) {
        setShowChannel(true);
      }
    };
    
    // Initial check
    if (typeof window !== 'undefined') {
      checkMobile();
      
      // Listen for window resize
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);
  
  // Close mobile sidebars when route changes
  useEffect(() => {
    if (isMobile) {
      setShowServer(false);
      setShowChannel(false);
      setShowMember(false);
    }
  }, [pathname, isMobile]);

  // Close all sidebars
  const closeSidebars = () => {
    setShowServer(false);
    setShowChannel(false);
    setShowMember(false);
  };

  const toggleServerList = () => {
    setShowServer(!showServer);
    setShowChannel(false);
    setShowMember(false);
  };

  const toggleChannelList = () => {
    setShowChannel(!showChannel);
    setShowServer(false);
    setShowMember(false);
  };

  const toggleMemberList = () => {
    setShowMember(!showMember);
    setShowServer(false);
    setShowChannel(false);
  };

  // Get server name for mobile header (instead of channel name)
  const getServerName = () => {
    if (!guildId) return "Discord for Bots";
    return serverName || "Discord Server";
  };

  return (
    <div className={`main-layout ${(showServer || showChannel || showMember) ? 'sidebar-active' : ''}`}>
      {/* Mobile nav buttons */}
      <div className="mobile-nav">
        <button
          className="nav-btn"
          onClick={toggleServerList}
          aria-label="Servers"
        >
          <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.942 5.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.586 11.586 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3 17.392 17.392 0 0 0-2.868 11.662 15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.638 10.638 0 0 1-1.706-.83c.143-.106.283-.217.418-.331a11.664 11.664 0 0 0 10.118 0c.137.114.277.225.418.331-.544.328-1.116.606-1.71.832a12.58 12.58 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM8.678 14.813a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.929 1.929 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"/>
          </svg>
        </button>
        
        <button 
          className="nav-btn"
          onClick={toggleChannelList}
          aria-label="Channels"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <div className="nav-title">{getServerName()}</div>
        
        <button
          className="nav-btn"
          onClick={toggleMemberList}
          aria-label="Members"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
      </div>

      {/* Overlay to close sidebars when clicked */}
      <div className="sidebar-overlay" onClick={closeSidebars}></div>

      {/* Sidebars: always visible on desktop, slide in/out on mobile */}
      <aside className={`sidebar server-list${showServer ? " active" : ""}`}>
        <ServerList />
      </aside>
      
      <aside className={`sidebar channel-list${showChannel ? " active" : ""}`}>
        <ChannelList />
        <button className="mobile-close" onClick={() => setShowChannel(false)}>×</button>
      </aside>
      
      <main className="chat-area content-area">{children}</main>
      
      <aside className={`sidebar member-list${showMember ? " active" : ""}`}>
        <MemberList />
        <button className="mobile-close" onClick={() => setShowMember(false)}>×</button>
      </aside>
      
      <DiscordListener />
    </div>
  );
}