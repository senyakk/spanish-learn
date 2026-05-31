import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json(null);

  await ensureSchema();
  const sql = getDb();
  const rows = await sql`SELECT progress FROM user_progress WHERE user_id = ${userId}`;
  return NextResponse.json(rows[0]?.progress ?? null);
}

export async function POST(req: NextRequest) {
  const { userId, progress } = await req.json();
  if (!userId || !progress) return NextResponse.json({ ok: false }, { status: 400 });

  await ensureSchema();
  const sql = getDb();
  await sql`
    INSERT INTO user_progress (user_id, progress, updated_at)
    VALUES (${userId}, ${JSON.stringify(progress)}, NOW())
    ON CONFLICT (user_id) DO UPDATE
      SET progress = EXCLUDED.progress, updated_at = NOW()
  `;
  return NextResponse.json({ ok: true });
}
