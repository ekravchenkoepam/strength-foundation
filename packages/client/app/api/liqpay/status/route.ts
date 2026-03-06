import { NextRequest, NextResponse } from 'next/server';

import { callLiqPayApi } from '@/app/lib/liqpay';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

type LiqPayStatusResponse = {
  result?: string;
  status?: string;
  action?: string;
  type?: string;
  order_id?: string;
  payment_id?: number;
  subscribe_id?: string;
  subscribe_date_start?: string;
  subscribe_date_stop?: string;
  subscribe_periodicity?: string;
  err_code?: string;
  err_description?: string;
  [key: string]: string | number | boolean | null | undefined;
};

export async function GET(request: NextRequest) {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: 'LiqPay keys are not configured on the server' },
      { status: 500 }
    );
  }

  const orderId = request.nextUrl.searchParams.get('orderId')?.trim();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId query param is required' }, { status: 400 });
  }

  try {
    const liqPayResponse = await callLiqPayApi<LiqPayStatusResponse>(
      {
        action: 'status',
        version: 3,
        public_key: publicKey,
        order_id: orderId,
      },
      privateKey
    );

    await syncLiqPayEventToStrapi({
      eventId: `status_${orderId}`,
      receivedAt: new Date(Number(liqPayResponse.end_date ?? Date.now())).toISOString(),
      source: 'status_api',
      signatureValid: true,
      payment: liqPayResponse,
    });

    return NextResponse.json({
      ok: true,
      orderId,
      liqPayResponse,
      interpretation: {
        // For recurring flows LiqPay can still return type=buy for the first successful charge.
        // action/subscription markers are more reliable than type for classification.
        isSubscription:
          Boolean(liqPayResponse.subscribe_id) ||
          liqPayResponse.action === 'subscribe' ||
          liqPayResponse.action === 'regular',
        isRegularPayment: liqPayResponse.action === 'regular',
        isOneTimePayment:
          liqPayResponse.action !== 'subscribe' &&
          liqPayResponse.action !== 'regular' &&
          !Boolean(liqPayResponse.subscribe_id) &&
          (liqPayResponse.type === 'buy' || liqPayResponse.action === 'pay'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to call LiqPay status',
      },
      { status: 500 }
    );
  }
}
