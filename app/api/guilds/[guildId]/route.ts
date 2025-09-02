import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { guildId: string } }) {
  const { guildId } = params;
  // TODO: Replace with actual data fetching logic for the guild
  return NextResponse.json({ guildId, message: "Dynamic route working!" });
}
