import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1692569392110800",
      name: "Chill Zone",
      icon: "b6d536d1332bd67725ca03729348c035",
      owner: false,
      permissions: "2147483647",
      features: ["COMMUNITY", "NEWS"],
    },
    {
      id: "1309817795755769926",
      name: "Gaming Hub",
      icon: "a_7d0831e354adae3c16656ae8fa311dda", // custom icon
      owner: true,
      permissions: "2147483647",
      features: ["DISCOVERABLE", "ANIMATED_ICON"],
    },
    {
      id: "169256939211980800",
      name: "Music Lounge",
      icon: "b6d536d1332bd67725ca03729348c035",
      owner: false,
      permissions: "104324673",
      features: [],
    },
  ]);
}
