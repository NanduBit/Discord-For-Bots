"use client";

import { Hash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

type Identity = {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string | null;
};

type Guild = { id: string; name: string; icon?: string | null };
type Channel = { id: string; name: string };

import useSWR from "swr";

export function ChannelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = useMemo(
    () => (pathname || "/").split("/").filter(Boolean),
    [pathname]
  );
  const guildId = segments[0] || null;
  const channelId = segments[1] || null;

  // Identity (bottom user card)
  const token = localStorage.getItem("token");
  const postFetcher = (url: string) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((r) => r.json());
  const { data: identity } = useSWR<Identity>("/api/identity", postFetcher);
  const displayName = identity?.username ?? "";
  const userTag = identity
    ? `${identity.username}#${identity.discriminator}`
    : "";
  const avatarSrc =
    identity?.id && identity?.avatar
      ? `https://cdn.discordapp.com/avatars/${identity.id}/${identity.avatar}.png`
      : "/diverse-user-avatars.png";

  // Guilds
  const { data: guilds = [] } = useSWR<Guild[]>("/api/guilds", postFetcher);
  const selectedGuild = guilds.find((g) => g.id === guildId) || null;

  // Channels
  const { data: channels = [] } = useSWR<Channel[]>(
    guildId ? `/api/guilds/${guildId}/channels` : null,
    postFetcher
  );

  useEffect(() => {
    if (!guildId || !channels.length) return;
    if (!channelId) {
      router.replace(`/${guildId}/${channels[0].id}`);
    }
  }, [guildId, channelId, channels, router]);

  return (
    <div className="relative flex h-dvh w-72 flex-col border-r border-white/5 bg-slate-950/80">
      <header className="px-4 pb-3 pt-4 text-sm font-medium text-slate-200">
        <div className="flex items-center gap-2">
          <Image
            src={
              selectedGuild?.icon
                ? `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`
                : "/guild-icon.png"
            }
            alt={selectedGuild ? `${selectedGuild.name} icon` : "Guild icon"}
            width={20}
            height={20}
            className="rounded-sm"
          />
          <span className="truncate">
            {selectedGuild?.name ?? "Unknown Guild"}
          </span>
        </div>
      </header>

      <nav className="flex-1 space-y-1 px-2">
        {channels.map((c) => {
          const isActive = c.id === channelId;
          return (
            <Link
              key={c.id}
              href={`/${guildId}/${c.id}`}
              className={[
                "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                isActive
                  ? "bg-violet-500/5 ring-1 ring-inset ring-violet-400/20"
                  : "hover:bg-slate-800/60",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Hash
                className={[
                  "h-4 w-4",
                  isActive ? "text-slate-200" : "text-slate-400",
                ].join(" ")}
              />
              <span className={isActive ? "text-slate-200" : "text-slate-300"}>
                #{c.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom docked user card */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3">
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-white/5 bg-slate-900/60 p-3">
          <Image
            src={avatarSrc || "/placeholder.svg"}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm text-slate-200">
              {displayName}
            </span>
            <span className="truncate text-xs text-slate-400">{userTag}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelSidebar;
