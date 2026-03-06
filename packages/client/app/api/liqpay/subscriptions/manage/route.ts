import { NextRequest, NextResponse } from 'next/server';

import { getSubscriptionsByManageToken } from '@/app/lib/liqpay-store';

export async function GET(request: NextRequest) {
  const token = String(request.nextUrl.searchParams.get('token') ?? '').trim();
  if (!token) {
    return NextResponse.json({ error: 'token query param is required' }, { status: 400 });
  }

  const data = await getSubscriptionsByManageToken(token);
  if (!data) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    email: data.email,
    subscriptions: data.subscriptions.map(sub => ({
      orderId: sub.orderId,
      status: sub.status,
      action: sub.action,
      amount: sub.amount ?? null,
      currency: sub.currency ?? null,
      periodicity: String(sub.payload.subscribe_periodicity ?? sub.payload.periodicity ?? ''),
      lastUpdateAt: sub.lastUpdateAt,
    })),
  });
}
