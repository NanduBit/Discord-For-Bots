import { NextRequest, NextResponse } from 'next/server';

// GET: channel details
// PATCH: update channel
// DELETE: delete channel
export async function GET(req: NextRequest, { params }: { params: { guildId: string, channelId: string } }) {
  // TODO: Implement channel details
  return NextResponse.json({ message: `Details for channel ${params.channelId} in guild ${params.guildId}` });
}

export async function PATCH(req: NextRequest, { params }: { params: { guildId: string, channelId: string } }) {
  // TODO: Implement channel update
  return NextResponse.json({ message: `Update channel ${params.channelId} in guild ${params.guildId}` });
}

export async function DELETE(req: NextRequest, { params }: { params: { guildId: string, channelId: string } }) {
  // TODO: Implement channel deletion
  return NextResponse.json({ message: `Delete channel ${params.channelId} in guild ${params.guildId}` });
}
