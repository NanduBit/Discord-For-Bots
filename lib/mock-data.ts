export type Identity = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
}

export type Guild = {
  id: string
  name: string
  iconUrl: string
}

export type Channel = {
  id: string
  guildId: string
  name: string
  type: "text"
  topic?: string
}

export type Message = {
  id: string
  guildId: string
  channelId: string
  content: string
  createdAt: string
  author: Pick<Identity, "id" | "displayName" | "avatarUrl">
}

// deterministic helpers so the same ids produce the same results
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length]

export const identity: Identity = {
  id: "u_01",
  username: "luna",
  displayName: "Luna",
  avatarUrl: "/luna-avatar.png",
}

export const guilds: Guild[] = ["lunish.nl", "devs den", "cats club"].map((name, i) => ({
  id: `g_${i + 1}`,
  name,
  iconUrl: "/guild-icon.png",
}))

// cache channels per guild so results are stable
const channelCache = new Map<string, Channel[]>()

export function getChannels(guildId: string): Channel[] {
  if (!channelCache.has(guildId)) {
    channelCache.set(guildId, getMockChannels(guildId))
  }
  return channelCache.get(guildId)!
}

// in-memory messages store keyed by `${guildId}:${channelId}`
const messagesStore = new Map<string, Message[]>()

function key(guildId: string, channelId: string) {
  return `${guildId}:${channelId}`
}

export function getMessages(guildId: string, channelId: string): Message[] {
  const k = key(guildId, channelId)
  if (!messagesStore.has(k)) {
    messagesStore.set(k, getMockMessages(guildId, channelId))
  }
  return messagesStore.get(k)!.slice() // return a copy
}

export function addMessage(guildId: string, channelId: string, content: string): Message {
  const k = key(guildId, channelId)
  const current = getMessages(guildId, channelId)
  const id = `m_${channelId}_${current.length + 1}`
  const author = {
    id: identity.id,
    displayName: identity.displayName,
    avatarUrl: identity.avatarUrl,
  }
  const msg: Message = {
    id,
    guildId,
    channelId,
    content,
    createdAt: new Date().toISOString(),
    author,
  }
  messagesStore.set(k, [...current, msg])
  return msg
}

function getMockChannels(guildId: string): Channel[] {
  const base = ["lounge", "announcements", "dev", "cmds"]
  return base.map((name, i) => ({
    id: `c_${guildId}_${i + 1}`,
    guildId,
    name,
    type: "text" as const,
    topic: name === "announcements" ? "Official updates" : undefined,
  }))
}

function getMockMessages(guildId: string, channelId: string): Message[] {
  const contents = ["hi", "this is cool", "proper chat box, meow :3", "helo"]
  return contents.map((content, i) => ({
    id: `m_${channelId}_${i + 1}`,
    guildId,
    channelId,
    content,
    createdAt: new Date(Date.now() - (contents.length - i) * 3600_000).toISOString(),
    author: {
      id: identity.id,
      displayName: pick(["mwlica", "luna"], i),
      avatarUrl: identity.avatarUrl,
    },
  }))
}
