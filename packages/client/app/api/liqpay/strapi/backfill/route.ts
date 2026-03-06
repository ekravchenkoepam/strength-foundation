import { NextResponse } from 'next/server';

import { getLiqPayStore } from '@/app/lib/liqpay-store';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

const toSource = (action: string): 'callback' | 'checkout_init' => {
  if (action === 'checkout_init') {
    return 'checkout_init';
  }
  return 'callback';
};

export async function POST() {
  const store = await getLiqPayStore();
  let synced = 0;

  for (const event of store.events) {
    await syncLiqPayEventToStrapi({
      eventId: event.id,
      receivedAt: event.receivedAt,
      source: toSource(String(event.payment.action ?? '')),
      signatureValid: event.signatureValid,
      payment: event.payment as Record<string, unknown>,
      requestMeta: event.requestMeta,
    });
    synced += 1;
  }

  return NextResponse.json({
    ok: true,
    totalEvents: store.events.length,
    synced,
  });
}
