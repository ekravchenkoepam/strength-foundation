import { NextRequest, NextResponse } from 'next/server';

import { buildLiqPayCheckout } from '@/app/lib/liqpay-checkout';

type CheckoutBody = {
  amount?: number;
  email?: string;
  locale?: string;
  mode?: 'pay' | 'subscribe';
  periodicity?: 'month' | 'year';
  subscribeDateStart?: string;
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

  const html = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LiqPay Redirect</title>
  </head>
  <body>
    <form id="liqpay-checkout-form" method="POST" action="${escapeHtml(checkout.checkoutUrl)}">
      <input type="hidden" name="data" value="${escapeHtml(checkout.data)}" />
      <input type="hidden" name="signature" value="${escapeHtml(checkout.signature)}" />
      <noscript>
        <button type="submit">Continue to LiqPay</button>
      </noscript>
    </form>
    <script>
      document.getElementById('liqpay-checkout-form')?.submit();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-LiqPay-Order-Id': checkout.orderId,
    },
  });
}
