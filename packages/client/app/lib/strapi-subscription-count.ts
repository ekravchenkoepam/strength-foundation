import 'server-only';

type StrapiSubscriptionResponse = {
  data: Array<{ id: number }>;
};

const SUBSCRIPTION_PAGE_SIZE = 100;

const getStrapiConfig = (): { baseUrl: string; token?: string } => {
  const baseUrl = (process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || '').replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

  if (!baseUrl) {
    throw new Error('Strapi subscription count is not configured');
  }

  return { baseUrl, ...(token ? { token } : {}) };
};

const fetchActiveSubscriptionCount = async (baseUrl: string, token?: string): Promise<number> => {
  let page = 1;
  let count = 0;

  while (true) {
    const query = new URLSearchParams({
      'filters[isActive][$eq]': 'true',
      'filters[status][$eq]': 'subscribed',
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

    count += payload.data.length;

    if (payload.data.length < SUBSCRIPTION_PAGE_SIZE) {
      return count;
    }

    page += 1;
  }
};

export const getActiveSubscriberCount = async (): Promise<number> => {
  const { baseUrl, token } = getStrapiConfig();
  return fetchActiveSubscriptionCount(baseUrl, token);
};
