"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { memo, useCallback, useMemo } from "react";
import { useDiscordContext } from "../context/DiscordContext";

// Helper function to truncate channel names
const truncateChannelName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength)}..`;
};

export default memo(function ChannelList() {
  const { activeServerId, serverName, channels, loading, error, refreshChannels } = useDiscordContext();
  const pathname = usePathname();
  
  // Log render for debugging
  console.log("Rendering ChannelList with:", { 
    serverName, 
    channelsCount: channels.length,
    activeServerId,
    loading: loading.channels
  });
  
  // Use useCallback to create stable render functions
  const renderTextChannel = useCallback((channel: any) => (
    <Link
      key={channel.id}
      href={`/app/${activeServerId}/${channel.id}`}
      className={`channel-link ${pathname.includes(`/${channel.id}`) ? 'active' : ''}`}
      scroll={false}
      shallow={true}
    >
      <svg className="w-[14px] h-[14px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
        <path d="M214.7 .7c17.3 3.7 28.3 20.7 24.6 38l-19.1 89.3 126.5 0 22-102.7C372.4 8 389.4-3 406.7 .7s28.3 20.7 24.6 38L412.2 128 480 128c17.7 0 32 14.3 32 32s-14.3 32-32 32l-81.6 0-27.4 128 67.8 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-81.6 0-22 102.7c-3.7 17.3-20.7 28.3-38 24.6s-28.3-20.7-24.6-38l19.1-89.3-126.5 0-22 102.7c-3.7 17.3-20.7 28.3-38 24.6s-28.3-20.7-24.6-38L99.8 384 32 384c-17.7 0-32-14.3-32-32s14.3-32 32-32l81.6 0 27.4-128-67.8 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l81.6 0 22-102.7C180.4 8 197.4-3 214.7 .7zM206.4 192l-27.4 128 126.5 0 27.4-128-126.5 0z"/>
      </svg> <span title={channel.name.length > 20 ? channel.name : ""}>{truncateChannelName(channel.name)}</span>
    </Link>
  ), [activeServerId, pathname]);
  
  const renderVoiceChannel = useCallback((channel: any) => (
    <div key={channel.id} className="voice-channel">
      <svg className="w-[19px] h-[19px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 6.037c0-1.724-1.978-2.665-3.28-1.562L5.638 7.933H4c-1.105 0-2 .91-2 2.034v4.066c0 1.123.895 2.034 2 2.034h1.638l4.082 3.458c1.302 1.104 3.28.162 3.28-1.562V6.037Z"/>
        <path fillRule="evenodd" d="M14.786 7.658a.988.988 0 0 1 1.414-.014A6.135 6.135 0 0 1 18 12c0 1.662-.655 3.17-1.715 4.27a.989.989 0 0 1-1.414.014 1.029 1.029 0 0 1-.014-1.437A4.085 4.085 0 0 0 16 12a4.085 4.085 0 0 0-1.2-2.904 1.029 1.029 0 0 1-.014-1.438Z" clipRule="evenodd"/>
        <path fillRule="evenodd" d="M17.657 4.811a.988.988 0 0 1 1.414 0A10.224 10.224 0 0 1 22 12c0 2.807-1.12 5.35-2.929 7.189a.988.988 0 0 1-1.414 0 1.029 1.029 0 0 1 0-1.438A8.173 8.173 0 0 0 20 12a8.173 8.173 0 0 0-2.343-5.751 1.029 1.029 0 0 1 0-1.438Z" clipRule="evenodd"/>
      </svg> <span title={channel.name.length > 20 ? channel.name : ""}>{truncateChannelName(channel.name)}</span>
    </div>
  ), []);
  
  // Memoize the channel groups rendering to prevent unnecessary re-renders
  const renderChannelGroups = useMemo(() => {
    if (!channels.length) return null;
    
    return channels.map((categoryGroup) => (
      <div key={categoryGroup.category?.id || "no-category"}>
        <div className="channel-category">
          {categoryGroup.category?.name || "No Category"}
        </div>
        
        {/* Text Channels */}
        {categoryGroup.text_channels.map(renderTextChannel)}
        
        {/* Voice Channels */}
        {categoryGroup.voice_channels.map(renderVoiceChannel)}
      </div>
    ));
  }, [channels, renderTextChannel, renderVoiceChannel]);
  
  return (
    <div id="channelList" className="channel-list-container thin-scrollbar">
      {/* Server name header */}
      <div className="channel-header">
        {loading.channels ? "Loading..." : activeServerId ? serverName : "Discord for Bots"}
      </div>

      {!activeServerId ? (
        // Show this message when no server is selected (we're on /app)
        <div className="channel-message">
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>��</div>
          <div>Please select a server from the left sidebar</div>
        </div>
      ) : error.channels ? (
        // Show error message when channel loading fails
        <div className="channel-error">
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>⚠️</div>
          <div>{error.channels}</div>
          <button
            onClick={refreshChannels}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      ) : loading.channels && channels.length === 0 ? (
        // Show loading animation when first loading channels
        <div className="channel-message">
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>⏳</div>
          <div>Loading channels...</div>
        </div>
      ) : channels.length > 0 ? (
        // Show channels when a server is selected and channels loaded successfully
        <div>
          {renderChannelGroups}
        </div>
      ) : (
        // Show simple text message when no channels are loaded
        <div className="channel-error">
          <div style={{ marginBottom: "12px", fontSize: "24px" }}>⚠️</div>
          <div>Failed to load channel list</div>
          <button
            onClick={refreshChannels}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
});
