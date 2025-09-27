"use client";

import React from "react";
import ServerList from "./ServerList";
import ChannelList from "./ChannelList";
import MemberList from "./MemberList";
import DiscordListener from "./websocket";

// This component will remain mounted even when routes change
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <ServerList />
      <ChannelList />
      {children}
      <MemberList />
      <DiscordListener />
    </div>
  );
};

export default MainLayout;