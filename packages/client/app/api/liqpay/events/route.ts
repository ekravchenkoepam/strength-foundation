import { NextResponse } from 'next/server';

import { getLiqPayStore } from '@/app/lib/liqpay-store';

export async function GET() {
  const store = await getLiqPayStore();
  return NextResponse.json(store);
}
