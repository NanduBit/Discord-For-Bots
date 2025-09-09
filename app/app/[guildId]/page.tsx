"use client";

import ServerList from '../../components/ServerList';
import ChannelList from '../../components/ChannelList';
import ChatArea from '../../components/ChatArea';
import MemberList from '../../components/MemberList';
import { useEffect } from 'react';

export default function Discord() {


  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <ServerList />
      <ChannelList />
      <ChatArea />
      <MemberList />
    </div>
  );
}
