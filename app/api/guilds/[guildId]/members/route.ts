import { NextRequest, NextResponse } from 'next/server';

// GET: list members in a guild
export async function GET(req: NextRequest, { params }: { params: { guildId: string } }) {
  // TODO: Implement listing members
  return NextResponse.json({ message: `List members in guild ${params.guildId}` });
}
