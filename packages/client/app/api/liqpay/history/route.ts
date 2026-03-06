import { NextRequest, NextResponse } from 'next/server';

import { getLiqPayStore } from '@/app/lib/liqpay-store';
import { callLiqPayApi } from '@/app/lib/liqpay';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

type HistoryType = 'payment' | 'subscription' | 'all';

type HistoryItem = {
  eventId: string;
  receivedAt: string;
  orderId: string;
  paymentId: string;
  action: string;
  status: string;
  amount: string;
  currency: string;
  type: 'payment' | 'subscription';
  subscribeId: string;
  periodicity: string;
  payload: Record<string, unknown>;
  source: 'callback' | 'status_api';
};

const toStringSafe = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const classify = (payment: Record<string, unknown>): 'payment' | 'subscription' | 'skip' => {
  const action = toStringSafe(payment.action);
  const mode = toStringSafe(payment.mode);
  const subscribeId = toStringSafe(payment.subscribe_id);
  const type = toStringSafe(payment.type);

  if (action === 'checkout_init') {
    return 'skip';
  }

  if (
    subscribeId ||
    action === 'subscribe' ||
    action === 'regular' ||
    action === 'unsubscribe' ||
    mode === 'subscribe'
  ) {
    return 'subscription';
  }

  if (action === 'pay' || type === 'buy' || mode === 'pay') {
    return 'payment';
  }

  return 'skip';
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

  const type = (request.nextUrl.searchParams.get('type') ?? 'all') as HistoryType;
  const status = (request.nextUrl.searchParams.get('status') ?? '').trim();
  const orderId = (request.nextUrl.searchParams.get('orderId') ?? '').trim();
  const from = request.nextUrl.searchParams.get('from');
  const to = request.nextUrl.searchParams.get('to');
  const sync = request.nextUrl.searchParams.get('sync') !== '0';
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 50);

  const isTypeValid = type === 'all' || type === 'payment' || type === 'subscription';
  if (!isTypeValid) {
    return NextResponse.json({ error: 'type must be one of: all, payment, subscription' }, { status: 400 });
  }

  const pageSafe = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const limitSafe = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 200) : 50;
  const fromTs = from ? Date.parse(from) : NaN;
  const toTs = to ? Date.parse(to) : NaN;

  if (from && Number.isNaN(fromTs)) {
    return NextResponse.json({ error: 'from must be a valid ISO date' }, { status: 400 });
  }
  if (to && Number.isNaN(toTs)) {
    return NextResponse.json({ error: 'to must be a valid ISO date' }, { status: 400 });
  }

  const store = await getLiqPayStore();

  const callbackItems: HistoryItem[] = [];
  for (const event of store.events) {
    const payment = event.payment as Record<string, unknown>;
    const kind = classify(payment);
    if (kind === 'skip') {
      continue;
    }

    callbackItems.push({
      eventId: event.id,
      receivedAt: event.receivedAt,
      orderId: toStringSafe(payment.order_id),
      paymentId: toStringSafe(payment.payment_id || payment.transaction_id),
      action: toStringSafe(payment.action),
      status: toStringSafe(payment.status),
      amount: toStringSafe(payment.amount),
      currency: toStringSafe(payment.currency),
      type: kind,
      subscribeId: toStringSafe(payment.subscribe_id),
      periodicity: toStringSafe(payment.subscribe_periodicity || payment.periodicity),
      payload: payment,
      source: 'callback',
    });
  }

  const candidateOrderIds = Array.from(
    new Set(
      store.events
        .map((event) => toStringSafe((event.payment as Record<string, unknown>).order_id))
        .filter(Boolean)
    )
  );

  const statusOrderIds = orderId ? [orderId] : candidateOrderIds;
  const statusItems: HistoryItem[] = [];

  if (sync) {
    for (const candidateOrderId of statusOrderIds) {
      try {
        const liqPayResponse = await callLiqPayApi<Record<string, unknown>>(
          {
            action: 'status',
            version: 3,
            public_key: publicKey,
            order_id: candidateOrderId,
          },
          privateKey
        );

        const result = toStringSafe(liqPayResponse.result);
        if (result !== 'ok') {
          continue;
        }

        const kind = classify(liqPayResponse);
        if (kind === 'skip') {
          continue;
        }

        statusItems.push({
          eventId: `status_${candidateOrderId}`,
          receivedAt: new Date(Number(liqPayResponse.end_date ?? Date.now())).toISOString(),
          orderId: toStringSafe(liqPayResponse.order_id),
          paymentId: toStringSafe(liqPayResponse.payment_id || liqPayResponse.transaction_id),
          action: toStringSafe(liqPayResponse.action),
          status: toStringSafe(liqPayResponse.status),
          amount: toStringSafe(liqPayResponse.amount),
          currency: toStringSafe(liqPayResponse.currency),
          type: kind,
          subscribeId: toStringSafe(liqPayResponse.subscribe_id),
          periodicity: toStringSafe(liqPayResponse.subscribe_periodicity),
          payload: liqPayResponse,
          source: 'status_api',
        });

        await syncLiqPayEventToStrapi({
          eventId: `status_${candidateOrderId}`,
          receivedAt: new Date(Number(liqPayResponse.end_date ?? Date.now())).toISOString(),
          source: 'status_api',
          signatureValid: true,
          payment: liqPayResponse,
        });
      } catch {
        // Ignore individual status fetch failures to keep history endpoint resilient.
      }
    }
  }

  const allItemsMap = new Map<string, HistoryItem>();
  [...callbackItems, ...statusItems].forEach((item) => {
    const key = `${item.orderId}:${item.paymentId}:${item.action}:${item.source}`;
    allItemsMap.set(key, item);
  });
  const allItems = Array.from(allItemsMap.values()).sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));

  const filtered = allItems.filter((item) => {
    if (type !== 'all' && item.type !== type) return false;
    if (status && item.status !== status) return false;
    if (orderId && item.orderId !== orderId) return false;

    const receivedAtTs = Date.parse(item.receivedAt);
    if (from && !Number.isNaN(receivedAtTs) && receivedAtTs < fromTs) return false;
    if (to && !Number.isNaN(receivedAtTs) && receivedAtTs > toTs) return false;
    return true;
  });

  const start = (pageSafe - 1) * limitSafe;
  const end = start + limitSafe;
  const items = filtered.slice(start, end);

  return NextResponse.json({
    filters: {
      type,
      status: status || null,
      orderId: orderId || null,
      from: from || null,
      to: to || null,
      sync,
      page: pageSafe,
      limit: limitSafe,
    },
    summary: {
      total: filtered.length,
      payments: filtered.filter((item) => item.type === 'payment').length,
      subscriptions: filtered.filter((item) => item.type === 'subscription').length,
    },
    items,
  });
}
