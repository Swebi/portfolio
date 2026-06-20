import { NextResponse } from 'next/server';

const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = 'portfolio:views';
const SEED = parseInt(process.env.VIEWS_SEED ?? '0', 10);

async function redis(command: string[]) {
  const res = await fetch(`${UPSTASH_URL}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    cache: 'no-store',
  });
  return res.json();
}

export async function GET() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return NextResponse.json({ views: null });
  }
  const { result } = await redis(['GET', KEY]);
  return NextResponse.json({ views: (Number(result) || 0) + SEED });
}

export async function POST() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return NextResponse.json({ views: null });
  }
  const { result } = await redis(['INCR', KEY]);
  return NextResponse.json({ views: (Number(result) || 0) + SEED });
}
