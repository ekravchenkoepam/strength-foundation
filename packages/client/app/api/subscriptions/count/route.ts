import { NextResponse } from 'next/server';

import { getActiveSubscriberCount } from '@/app/lib/strapi-subscription-count';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getActiveSubscriberCount();

    console.info('[Subscription count] Loaded subscription aggregates', {
      total: result.total,
      active: result.active,
      subscribed: result.subscribed,
      activeAndSubscribed: result.count,
    });

    return NextResponse.json(
      { count: result.count },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Subscription-Count-Strategy': 'records-v2',
        },
      }
    );
  } catch (error) {
    console.error('[Subscription count] Failed to load active subscriber count', error);
    return NextResponse.json({ error: 'Failed to load subscriber count' }, { status: 503 });
  }
}
