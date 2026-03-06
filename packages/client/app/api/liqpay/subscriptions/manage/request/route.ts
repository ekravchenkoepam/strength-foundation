import { NextRequest, NextResponse } from 'next/server';

import { createManageTokenForEmail } from '@/app/lib/liqpay-store';

type RequestBody = {
  email?: string;
  locale?: string;
};

export async function POST(request: NextRequest) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim();
  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const tokenData = await createManageTokenForEmail(email);
  if (!tokenData) {
    return NextResponse.json({ error: 'No subscriptions found for this email' }, { status: 404 });
  }

  const locale = body.locale === 'en' ? 'en' : 'uk';
  const publicBaseUrl = (process.env.LIQPAY_PUBLIC_BASE_URL || request.nextUrl.origin).replace(/\/$/, '');
  const manageUrl = `${publicBaseUrl}/${locale}/donate/manage?token=${encodeURIComponent(tokenData.token)}`;

  return NextResponse.json({
    ok: true,
    email,
    manageUrl,
    expiresAt: tokenData.expiresAt,
  });
}
