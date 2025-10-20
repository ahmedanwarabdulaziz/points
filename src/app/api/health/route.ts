import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'CADEALA API is working',
    timestamp: new Date().toISOString()
  });
}
