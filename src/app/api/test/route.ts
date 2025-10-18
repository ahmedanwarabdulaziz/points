import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'success',
    message: 'CADEALA API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL === '1' ? 'Yes' : 'No'
  });
}
