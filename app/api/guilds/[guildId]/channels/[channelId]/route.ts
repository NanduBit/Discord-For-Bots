import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "991111111111111111",
      channel_id: "555555555555555555",
      guild_id: "169256939211980800",
      author: {
        id: "123456789012345678",
        username: "MyBot",
        avatar: "a_3c1b3d8b59d06f9d3f7df9a4b7f49b1d",
        discriminator: "0000",
        bot: true,
      },
      content: "Hello world! 👋",
      timestamp: "2023-09-01T12:00:00.000Z",
      edited_timestamp: null,
      mentions: [],
      mention_roles: [],
      pinned: false,
      type: 0,
    },
    {
      id: "992222222222222222",
      channel_id: "555555555555555555",
      guild_id: "169256939211980800",
      author: {
        id: "876543210987654321",
        username: "UserOne",
        avatar: null,
        discriminator: "1234",
        bot: false,
      },
      content: "What's up?",
      timestamp: "2023-09-01T12:05:00.000Z",
      edited_timestamp: null,
      mentions: [],
      mention_roles: [],
      pinned: false,
      type: 0,
    },
    {
      id: "993333333333333333",
      channel_id: "555555555555555555",
      guild_id: "169256939211980800",
      author: {
        id: "222222222222222222",
        username: "DJ",
        avatar: "b6d536d1332bd67725ca03729348c035",
        discriminator: "5678",
        bot: false,
      },
      content: "Playing some music 🎶",
      timestamp: "2023-09-01T12:10:00.000Z",
      edited_timestamp: null,
      mentions: [],
      mention_roles: [],
      pinned: false,
      type: 0,
    }
  ]);
}
