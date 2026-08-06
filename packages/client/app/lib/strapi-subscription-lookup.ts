import 'server-only';

type StrapiSubscriptionFields = {
  action?: string;
  email?: string;
  isActive?: boolean;
  orderId?: string;
  payload?: Record<string, unknown> | null;
  status?: string;
  subscribeId?: string;
};

type StrapiSubscriptionEntity = StrapiSubscriptionFields & {
  id: number;
  attributes?: StrapiSubscriptionFields;
};

type StrapiSubscriptionResponse = {
  data: StrapiSubscriptionEntity[];
};

export type SubscriptionCancellationCandidate = {
  orderId: string;
  subscribeId: string;
};

const getStrapiConfig = (): { baseUrl: string; token?: string } | null => {
  const baseUrl = (process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || '').replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

  if (!baseUrl) return null;

  return { baseUrl, ...(token ? { token } : {}) };
};

const getFields = (entity: StrapiSubscriptionEntity): StrapiSubscriptionFields => entity.attributes ?? entity;

export const getActiveStrapiSubscriptionsByEmail = async (
  emailRaw: string
): Promise<SubscriptionCancellationCandidate[]> => {
  const config = getStrapiConfig();
  const email = emailRaw.trim().toLowerCase();

  if (!config || !email) return [];

  const query = new URLSearchParams();
  query.set('filters[email][$eqi]', email);
  query.set('filters[isActive][$eq]', 'true');
  query.set('fields[0]', 'orderId');
  query.set('fields[1]', 'subscribeId');
  query.set('fields[2]', 'email');
  query.set('fields[3]', 'action');
  query.set('fields[4]', 'status');
  query.set('fields[5]', 'isActive');
  query.set('fields[6]', 'payload');
  query.set('pagination[pageSize]', '100');
  query.set('sort', 'lastEventAt:desc');

  const response = await fetch(`${config.baseUrl}/api/subscriptions?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Strapi subscription lookup failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as StrapiSubscriptionResponse;
  if (!Array.isArray(payload.data)) {
    throw new Error('Strapi subscription lookup response did not include a valid data array');
  }

  return payload.data.flatMap(entity => {
    const fields = getFields(entity);
    const orderId = String(fields.orderId ?? '').trim();
    const action = String(fields.action ?? '').trim().toLowerCase();
    const status = String(fields.status ?? '').trim().toLowerCase();

    if (!orderId || fields.isActive !== true || action === 'unsubscribe' || status === 'unsubscribed') {
      return [];
    }

    const subscribeId = String(fields.subscribeId ?? fields.payload?.subscribe_id ?? '').trim();
    return [{ orderId, subscribeId }];
  });
};
