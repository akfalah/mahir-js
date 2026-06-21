import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_URL = process.env.API_URL || 'http://localhost:8888';

async function handler(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const path = request.nextUrl.pathname.replace('/api', '');
  const search = request.nextUrl.search;
  const url = `${EXPRESS_URL}/api${path}${search}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: string | undefined;

  if (request.method !== 'GET' && request.method !== 'DELETE') {
    body = await request.text();
  }

  const res = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  const data = await res.json();
  
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
