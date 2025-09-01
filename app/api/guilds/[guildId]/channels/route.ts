import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "111111111111111111",
      type: 0, // 0 = text channel
      guild_id: "123456789012345678",
      name: "general",
      position: 0,
      topic: "General discussion",
      nsfw: false,
      last_message_id: "987654321098765432",
      parent_id: null,
      rate_limit_per_user: 0,
      permissions: "0"
    },
    {
      id: "222222222222222222",
      type: 0,
      guild_id: "123456789012345678",
      name: "bot-commands",
      position: 1,
      topic: "Commands only",
      nsfw: false,
      last_message_id: "987654321098765433",
      parent_id: null,
      rate_limit_per_user: 0,
      permissions: "0"
    },
    {
      id: "333333333333333333",
      type: 0,
      guild_id: "123456789012345678",
      name: "off-topic",
      position: 2,
      topic: "Random stuff",
      nsfw: false,
      last_message_id: null,
      parent_id: null,
      rate_limit_per_user: 0,
      permissions: "0"
    }
  ]);
}
