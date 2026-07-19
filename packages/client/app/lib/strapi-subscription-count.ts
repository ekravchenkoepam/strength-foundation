import 'server-only';

type StrapiSubscriptionResponse = {
  data: Array<{
    id: number;
    isActive?: boolean;
    status?: string;
    attributes?: {
      isActive?: boolean;
      status?: string;
    };
  }>;
};

const SUBSCRIPTION_PAGE_SIZE = 100;

export type ActiveSubscriberCount = {
  count: number;
  total: number;
  active: number;
  subscribed: number;
};

const getStrapiConfig = (): { baseUrl: string; token?: string } => {
  const baseUrl = (process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || '').replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

  if (!baseUrl) {
    throw new Error('Strapi subscription count is not configured');
  }

  return { baseUrl, ...(token ? { token } : {}) };
};

const fetchActiveSubscriptionCount = async (baseUrl: string, token?: string): Promise<ActiveSubscriberCount> => {
  let page = 1;
  const result: ActiveSubscriberCount = {
    count: 0,
    total: 0,
    active: 0,
    subscribed: 0,
  };

  while (true) {
    const query = new URLSearchParams({
      'fields[0]': 'isActive',
      'fields[1]': 'status',
      'pagination[page]': String(page),
      'pagination[pageSize]': String(SUBSCRIPTION_PAGE_SIZE),
      'pagination[withCount]': 'false',
      sort: 'id:asc',
    });

    const response = await fetch(`${baseUrl}/api/subscriptions?${query}`, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Strapi subscription count failed: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as StrapiSubscriptionResponse;
    if (!Array.isArray(payload.data)) {
      throw new Error('Strapi subscription count response did not include a valid data array');
    }

    result.total += payload.data.length;

    for (const subscription of payload.data) {
      const fields = subscription.attributes ?? subscription;
      const isActive = fields.isActive === true;
      const isSubscribed =
        String(fields.status ?? '')
          .trim()
          .toLowerCase() === 'subscribed';

      if (isActive) result.active += 1;
      if (isSubscribed) result.subscribed += 1;
      if (isActive && isSubscribed) result.count += 1;
    }

    if (payload.data.length < SUBSCRIPTION_PAGE_SIZE) {
      return result;
    }

    page += 1;
  }
};

export const getActiveSubscriberCount = async (): Promise<ActiveSubscriberCount> => {
  const { baseUrl, token } = getStrapiConfig();
  return fetchActiveSubscriptionCount(baseUrl, token);
};
