import type { StoredCallbackEvent } from '@/app/lib/liqpay-store';

type SyncSource = 'callback' | 'status_api' | 'checkout_init' | 'system';

type SyncEventInput = {
  eventId: string;
  receivedAt: string;
  source: SyncSource;
  signatureValid: boolean;
  payment: Record<string, unknown>;
  requestMeta?: StoredCallbackEvent['requestMeta'];
};

type StrapiEntity<T> = {
  id: number;
  attributes: T;
};

type StrapiListResponse<T> = {
  data: Array<StrapiEntity<T>>;
};

const toStringSafe = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const toNumberSafe = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeEmail = (value: unknown): string => toStringSafe(value).trim().toLowerCase();

const toIsoDateSafe = (value: unknown, fallbackIso: string): string => {
  const numeric = toNumberSafe(value);
  if (numeric && Number.isFinite(numeric)) {
    return new Date(numeric).toISOString();
  }

  const parsed = Date.parse(toStringSafe(value));
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const fallbackParsed = Date.parse(fallbackIso);
  if (!Number.isNaN(fallbackParsed)) {
    return new Date(fallbackParsed).toISOString();
  }

  return new Date().toISOString();
};

const getStrapiConfig = (): { baseUrl: string; token: string } | null => {
  const baseUrl = (
    process.env.STRAPI_API_URL ||
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    ''
  ).replace(/\/$/, '');

  const token = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

  if (!baseUrl || !token) {
    return null;
  }

  return { baseUrl, token };
};

const strapiRequest = async <T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strapi request failed: HTTP ${response.status} ${text}`);
  }

  return (await response.json()) as T;
};

const classifyEventType = (payment: Record<string, unknown>): 'payment' | 'subscription' | 'intent' | 'unknown' => {
  const action = toStringSafe(payment.action);
  const mode = toStringSafe(payment.mode);
  const subscribeId = toStringSafe(payment.subscribe_id);
  const type = toStringSafe(payment.type);

  if (action === 'checkout_init') {
    return 'intent';
  }

  if (
    subscribeId ||
    action === 'subscribe' ||
    action === 'regular' ||
    action === 'unsubscribe' ||
    mode === 'subscribe'
  ) {
    return 'subscription';
  }

  if (action === 'pay' || type === 'buy' || mode === 'pay') {
    return 'payment';
  }

  return 'unknown';
};

const findOneByField = async (
  baseUrl: string,
  token: string,
  endpoint: string,
  field: string,
  value: string
): Promise<number | null> => {
  const query = new URLSearchParams();
  query.set(`filters[${field}][$eq]`, value);
  query.set('pagination[pageSize]', '1');

  const response = await strapiRequest<StrapiListResponse<Record<string, unknown>>>(
    `${baseUrl}/api/${endpoint}?${query.toString()}`,
    token
  );

  return response.data[0]?.id ?? null;
};

const upsertPaymentTransaction = async (
  baseUrl: string,
  token: string,
  event: SyncEventInput
): Promise<void> => {
  const payment = event.payment;
  const eventType = classifyEventType(payment);
  const eventAt = toIsoDateSafe(payment.end_date, event.receivedAt);

  const data: Record<string, unknown> = {
    eventKey: `${event.source}:${event.eventId}`,
    source: event.source,
    eventType,
    eventAt,
    orderId: toStringSafe(payment.order_id),
    liqpayOrderId: toStringSafe(payment.liqpay_order_id),
    paymentId: toStringSafe(payment.payment_id || payment.transaction_id || payment.id),
    description: toStringSafe(payment.description),
    senderPhone: toStringSafe(payment.sender_phone || payment.confirm_phone),
    paymentType: toStringSafe(payment.paytype || payment.pay_type),
    action: toStringSafe(payment.action),
    status: toStringSafe(payment.status),
    type: toStringSafe(payment.type),
    mode: toStringSafe(payment.mode || payment.outgoing_action),
    periodicity: toStringSafe(payment.subscribe_periodicity || payment.periodicity),
    amount: toNumberSafe(payment.amount),
    currency: toStringSafe(payment.currency),
    subscribeId: toStringSafe(payment.subscribe_id),
    email: normalizeEmail(payment.sender_email) || null,
    signatureValid: event.signatureValid,
    payload: payment,
    requestMeta: event.requestMeta ?? null,
  };

  const existingId = await findOneByField(baseUrl, token, 'payment-transactions', 'eventKey', String(data.eventKey));

  if (existingId) {
    await strapiRequest(`${baseUrl}/api/payment-transactions/${existingId}`, token, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    return;
  }

  await strapiRequest(`${baseUrl}/api/payment-transactions`, token, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
};

const upsertSubscription = async (baseUrl: string, token: string, event: SyncEventInput): Promise<void> => {
  const payment = event.payment;
  const orderId = toStringSafe(payment.order_id).trim();
  if (!orderId) {
    return;
  }

  const eventType = classifyEventType(payment);
  if (eventType !== 'subscription' && !(toStringSafe(payment.mode) === 'subscribe')) {
    return;
  }

  const action = toStringSafe(payment.action);
  const status = toStringSafe(payment.status);
  const isActive = !(action === 'unsubscribe' || status === 'unsubscribed' || status === 'failure');
  const eventAt = toIsoDateSafe(payment.end_date, event.receivedAt);

  const data: Record<string, unknown> = {
    orderId,
    subscribeId: toStringSafe(payment.subscribe_id) || null,
    email: normalizeEmail(payment.sender_email) || null,
    customer: toStringSafe(payment.customer || `${toStringSafe(payment.sender_first_name)} ${toStringSafe(payment.sender_last_name)}`.trim()) || null,
    status: status || 'unknown',
    action: action || null,
    isActive,
    amount: toNumberSafe(payment.amount),
    currency: toStringSafe(payment.currency) || null,
    periodicity: toStringSafe(payment.subscribe_periodicity || payment.periodicity) || null,
    lastEventAt: eventAt,
    lastPaymentId: toStringSafe(payment.payment_id || payment.transaction_id) || null,
    source: event.source,
    payload: payment,
  };

  const existingId = await findOneByField(baseUrl, token, 'subscriptions', 'orderId', orderId);
  if (existingId) {
    await strapiRequest(`${baseUrl}/api/subscriptions/${existingId}`, token, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    return;
  }

  await strapiRequest(`${baseUrl}/api/subscriptions`, token, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
};

export const syncLiqPayEventToStrapi = async (event: SyncEventInput): Promise<void> => {
  const config = getStrapiConfig();
  if (!config) {
    return;
  }

  try {
    await upsertPaymentTransaction(config.baseUrl, config.token, event);
    await upsertSubscription(config.baseUrl, config.token, event);
  } catch (error) {
    console.error('[Strapi sync] Failed to sync LiqPay event', {
      eventId: event.eventId,
      source: event.source,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
