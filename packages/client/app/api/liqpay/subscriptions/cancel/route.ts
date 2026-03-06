import { NextRequest, NextResponse } from 'next/server';

import { callLiqPayApi } from '@/app/lib/liqpay';
import { getLiqPayStore, saveCallbackEvent } from '@/app/lib/liqpay-store';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

type CancelBody = {
  orderId?: string;
};

type LiqPayCancelResponse = {
  result?: string;
  status?: string;
  action?: string;
  subscribe_id?: string;
  code?: string;
  err_code?: string;
  err_description?: string;
};

export async function POST(request: NextRequest) {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: 'LiqPay keys are not configured on the server' },
      { status: 500 }
    );
  }

  let body: CancelBody;
  try {
    body = (await request.json()) as CancelBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const orderId = String(body.orderId ?? '').trim();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  try {
    const store = await getLiqPayStore();
    const knownSubscription = store.subscriptions[orderId];
    let subscribeId = String(knownSubscription?.subscribeId || '').trim();

    let liqPayStatus: Record<string, string | number | boolean | null | undefined> | null = null;
    if (!subscribeId) {
      liqPayStatus = await callLiqPayApi<Record<string, string | number | boolean | null | undefined>>(
        {
          action: 'status',
          version: 3,
          public_key: publicKey,
          order_id: orderId,
        },
        privateKey
      );

      subscribeId = String(liqPayStatus.subscribe_id ?? '').trim();

      const statusAction = String(liqPayStatus.action ?? '').trim();
      const looksLikeRecurring =
        statusAction === 'subscribe' || statusAction === 'regular' || Boolean(subscribeId);

      if (!looksLikeRecurring) {
        return NextResponse.json(
          {
            ok: false,
            orderId,
            error: 'This order is not an active recurring subscription in LiqPay',
            liqPayStatus,
          },
          { status: 409 }
        );
      }
    }

    const liqPayResponse = await callLiqPayApi<LiqPayCancelResponse>(
      {
        action: 'unsubscribe',
        version: 3,
        public_key: publicKey,
        order_id: orderId,
        ...(subscribeId ? { subscribe_id: subscribeId } : {}),
      },
      privateKey
    );

    const failed =
      liqPayResponse.result !== 'ok' ||
      liqPayResponse.status === 'failure' ||
      Boolean(liqPayResponse.err_code) ||
      Boolean(liqPayResponse.code);

    if (failed) {
      return NextResponse.json(
        {
          ok: false,
          orderId,
          error:
            liqPayResponse.err_description ||
            liqPayResponse.err_code ||
            liqPayResponse.code ||
            'Failed to unsubscribe recurring payment in LiqPay',
          liqPayResponse,
          ...(liqPayStatus ? { liqPayStatus } : {}),
        },
        { status: 409 }
      );
    }

    const savedEvent = await saveCallbackEvent({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: new Date().toISOString(),
      signatureValid: true,
      payment: {
        action: 'unsubscribe',
        status: String(liqPayResponse.status ?? 'success'),
        order_id: orderId,
        ...(subscribeId ? { subscribe_id: subscribeId } : {}),
        ...(knownSubscription?.email ? { sender_email: knownSubscription.email } : {}),
      },
      requestMeta: {
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        contentType: request.headers.get('content-type'),
        xForwardedFor: request.headers.get('x-forwarded-for'),
      },
    });

    await syncLiqPayEventToStrapi({
      eventId: savedEvent.id,
      receivedAt: savedEvent.receivedAt,
      source: 'system',
      signatureValid: true,
      payment: savedEvent.payment as Record<string, unknown>,
      requestMeta: savedEvent.requestMeta,
    });

    return NextResponse.json({
      ok: true,
      orderId,
      liqPayResponse,
      ...(liqPayStatus ? { liqPayStatus } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to call LiqPay unsubscribe',
      },
      { status: 500 }
    );
  }
}
