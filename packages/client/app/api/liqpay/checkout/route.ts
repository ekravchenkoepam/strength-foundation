import { NextRequest, NextResponse } from 'next/server';

import { buildLiqPayCheckout, type CheckoutBody } from '@/app/lib/liqpay-checkout';
import { saveCallbackEvent } from '@/app/lib/liqpay-store';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

export async function POST(request: NextRequest) {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: 'LiqPay keys are not configured on the server' },
      { status: 500 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let checkout: ReturnType<typeof buildLiqPayCheckout>;
  try {
    checkout = buildLiqPayCheckout({
      body,
      origin: request.nextUrl.origin,
      publicKey,
      privateKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to build LiqPay checkout' },
      { status: 400 }
    );
  }

  const savedEvent = await saveCallbackEvent({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    signatureValid: true,
    payment: {
      action: 'checkout_init',
      status: 'created',
      order_id: checkout.orderId,
      mode: checkout.mode,
      outgoing_action: checkout.mode,
      outgoing_subscribe: checkout.mode === 'subscribe',
      periodicity: checkout.mode === 'subscribe' ? checkout.periodicity : 'none',
      subscribe_date_start: checkout.subscribeDateStart,
      amount: checkout.amount,
      currency: checkout.currency,
      sender_email: checkout.senderEmail,
      public_base_url: checkout.publicBaseUrl,
      callback_url: `${checkout.publicBaseUrl}/api/liqpay/callback`,
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
    source: 'checkout_init',
    signatureValid: true,
    payment: savedEvent.payment as Record<string, unknown>,
    requestMeta: savedEvent.requestMeta,
  });

  return NextResponse.json({
    checkoutUrl: checkout.checkoutUrl,
    data: checkout.data,
    signature: checkout.signature,
    orderId: checkout.orderId,
  });
}
