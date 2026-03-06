import { NextRequest, NextResponse } from 'next/server';

import { callLiqPayApi } from '@/app/lib/liqpay';
import {
  getSubscriptionOrderIdsByEmailFromEvents,
  getSubscriptionsByEmail,
  saveCallbackEvent,
} from '@/app/lib/liqpay-store';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

type CancelByEmailBody = {
  email?: string;
};

type LiqPayResponse = {
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
    return NextResponse.json({ error: 'LiqPay keys are not configured on the server' }, { status: 500 });
  }

  let body: CancelByEmailBody;
  try {
    body = (await request.json()) as CancelByEmailBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const subscriptions = await getSubscriptionsByEmail(email);
  const directOrderIds = subscriptions.filter(sub => sub.action !== 'unsubscribe').map(sub => sub.orderId);
  const eventOrderIds = await getSubscriptionOrderIdsByEmailFromEvents(email);
  const candidateOrderIds = Array.from(new Set([...directOrderIds, ...eventOrderIds]));

  if (!candidateOrderIds.length) {
    return NextResponse.json({ error: 'No active subscriptions found for this email' }, { status: 404 });
  }

  const cancelled: string[] = [];
  const failed: Array<{ orderId: string; error: string }> = [];

  for (const orderId of candidateOrderIds) {
    try {
      const sub = subscriptions.find(item => item.orderId === orderId);
      let subscribeId = String(sub?.subscribeId ?? '').trim();

      if (!subscribeId) {
        const statusResponse = await callLiqPayApi<Record<string, string | number | boolean | null | undefined>>(
          {
            action: 'status',
            version: 3,
            public_key: publicKey,
            order_id: orderId,
          },
          privateKey
        );

        subscribeId = String(statusResponse.subscribe_id ?? '').trim();
        const statusAction = String(statusResponse.action ?? '').trim();
        const isRecurring = statusAction === 'subscribe' || statusAction === 'regular' || Boolean(subscribeId);
        if (!isRecurring) {
          failed.push({ orderId, error: 'Not an active recurring subscription in LiqPay' });
          continue;
        }
      }

      const response = await callLiqPayApi<LiqPayResponse>(
        {
          action: 'unsubscribe',
          version: 3,
          public_key: publicKey,
          order_id: orderId,
          ...(subscribeId ? { subscribe_id: subscribeId } : {}),
        },
        privateKey
      );

      const isFailed =
        response.result !== 'ok' ||
        response.status === 'failure' ||
        Boolean(response.err_code) ||
        Boolean(response.code);

      if (isFailed) {
        failed.push({
          orderId,
          error:
            response.err_description ||
            response.err_code ||
            response.code ||
            'Failed to unsubscribe recurring payment in LiqPay',
        });
        continue;
      }

      cancelled.push(orderId);

      const savedEvent = await saveCallbackEvent({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        receivedAt: new Date().toISOString(),
        signatureValid: true,
        payment: {
          action: 'unsubscribe',
          status: String(response.status ?? 'success'),
          order_id: orderId,
          ...(subscribeId ? { subscribe_id: subscribeId } : {}),
          sender_email: email,
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
    } catch (error) {
      failed.push({ orderId, error: error instanceof Error ? error.message : 'Unsubscribe failed' });
    }
  }

  return NextResponse.json({
    ok: failed.length === 0,
    email,
    totalFound: candidateOrderIds.length,
    cancelled,
    failed,
  });
}
