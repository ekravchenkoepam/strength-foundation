import { NextResponse } from 'next/server';

import { getActiveSubscriberCount } from '@/app/lib/strapi-subscription-count';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await getActiveSubscriberCount();

    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[Subscription count] Failed to load active subscriber count', error);
    return NextResponse.json({ error: 'Failed to load subscriber count' }, { status: 503 });
  }
}
