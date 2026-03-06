import { NextRequest, NextResponse } from 'next/server';

import { createLiqPaySignature, decodeLiqPayData } from '@/app/lib/liqpay';
import { saveCallbackEvent } from '@/app/lib/liqpay-store';
import { syncLiqPayEventToStrapi } from '@/app/lib/strapi-liqpay-sync';

type LiqPayCallbackPayload = Record<string, string | number | boolean | null>;

export async function GET() {
  return NextResponse.json({ ok: true, message: 'LiqPay callback endpoint is reachable' });
}

export async function POST(request: NextRequest) {
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  if (!privateKey) {
    return new NextResponse('Server is not configured', { status: 500 });
  }

  const form = await request.formData();
  const data = String(form.get('data') ?? '');
  const signature = String(form.get('signature') ?? '');

  if (!data || !signature) {
    await saveCallbackEvent({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: new Date().toISOString(),
      signatureValid: false,
      payment: {
        action: 'callback_error',
        status: 'missing_data_or_signature',
        data_exists: Boolean(data),
        signature_exists: Boolean(signature),
      },
      requestMeta: {
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        contentType: request.headers.get('content-type'),
        xForwardedFor: request.headers.get('x-forwarded-for'),
      },
    });
    console.error('[LiqPay callback] Missing fields', { dataExists: Boolean(data), signatureExists: Boolean(signature) });
    return new NextResponse('Missing data/signature', { status: 400 });
  }

  const expectedSignature = createLiqPaySignature(data, privateKey);
  const signatureValid = signature === expectedSignature;
  if (!signatureValid) {
    await saveCallbackEvent({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: new Date().toISOString(),
      signatureValid: false,
      payment: {
        action: 'callback_error',
        status: 'invalid_signature',
        signature_received_prefix: signature.slice(0, 12),
        expected_signature_prefix: expectedSignature.slice(0, 12),
      },
      requestMeta: {
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        contentType: request.headers.get('content-type'),
        xForwardedFor: request.headers.get('x-forwarded-for'),
      },
    });
    console.error('[LiqPay callback] Invalid signature');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const payload = decodeLiqPayData<LiqPayCallbackPayload>(data);
  const receivedAt = new Date().toISOString();

  const savedEvent = await saveCallbackEvent({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt,
    signatureValid,
    payment: payload,
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
    source: 'callback',
    signatureValid,
    payment: payload,
    requestMeta: savedEvent.requestMeta,
  });

  console.log(
    '[LiqPay callback] Event received:',
    JSON.stringify(
      {
        eventId: savedEvent.id,
        receivedAt,
        signatureValid,
        requestMeta: savedEvent.requestMeta,
        payment: payload,
      },
      null,
      2
    )
  );

  return new NextResponse('ok');
}
