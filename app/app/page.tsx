"use client";

import ServerList from '../components/ServerList';
import ChannelList from '../components/ChannelList';
import ChatArea from '../components/ChatArea';
import MemberList from '../components/MemberList';

export default function Discord() {
  return (
    <>
      <ServerList />
      <ChannelList />
      <ChatArea />
      <MemberList />
    </>
  );
}
