import 'server-only';

type StrapiSubscriptionResponse = {
  data: Array<{ id: number }>;
  meta?: {
    pagination?: {
      total?: number;
    };
  };
};

const getStrapiConfig = (): { baseUrl: string; token: string } => {
  const baseUrl = (process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || '').replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

  if (!baseUrl || !token) {
    throw new Error('Strapi subscription count is not configured');
  }

  return { baseUrl, token };
};

const fetchActiveSubscriptionCount = async (baseUrl: string, token: string): Promise<number> => {
  const query = new URLSearchParams({
    'filters[isActive][$eq]': 'true',
    'filters[status][$eq]': 'subscribed',
    'pagination[pageSize]': '1',
    'pagination[withCount]': 'true',
  });

  const response = await fetch(`${baseUrl}/api/subscriptions?${query}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Strapi subscription count failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as StrapiSubscriptionResponse;
  const count = payload.meta?.pagination?.total;

  if (!Number.isInteger(count) || Number(count) < 0) {
    throw new Error('Strapi subscription count response did not include a valid total');
  }

  return Number(count);
};

export const getActiveSubscriberCount = async (): Promise<number> => {
  const { baseUrl, token } = getStrapiConfig();
  return fetchActiveSubscriptionCount(baseUrl, token);
};
