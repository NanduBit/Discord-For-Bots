import { NextRequest, NextResponse } from 'next/server';

// GET: guild details
// PATCH: update guild
// DELETE: delete guild
export async function GET(req: NextRequest, { params }: { params: { guildId: string } }) {
  // TODO: Implement guild details
  return NextResponse.json({ message: `Details for guild ${params.guildId}` });
}

export async function PATCH(req: NextRequest, { params }: { params: { guildId: string } }) {
  // TODO: Implement guild update
  return NextResponse.json({ message: `Update guild ${params.guildId}` });
}

export async function DELETE(req: NextRequest, { params }: { params: { guildId: string } }) {
  // TODO: Implement guild deletion
  return NextResponse.json({ message: `Delete guild ${params.guildId}` });
}
