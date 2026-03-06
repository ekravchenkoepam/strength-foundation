import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';

const STORE_PATH = '/tmp/liqpay-poc-store.json';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type StoredCallbackEvent = {
  id: string;
  receivedAt: string;
  signatureValid: boolean;
  payment: Record<string, JsonValue>;
  requestMeta: {
    method: string;
    userAgent: string | null;
    contentType: string | null;
    xForwardedFor: string | null;
  };
};

export type StoredSubscription = {
  orderId: string;
  status: string;
  action?: string;
  amount?: number | string;
  currency?: string;
  subscribeId?: string;
  customer?: string;
  email?: string;
  lastUpdateAt: string;
  payload: Record<string, JsonValue>;
};

type LiqPayStore = {
  events: StoredCallbackEvent[];
  subscriptions: Record<string, StoredSubscription>;
  manageTokens: Array<{
    token: string;
    email: string;
    createdAt: string;
    expiresAt: string;
  }>;
};

const DEFAULT_STORE: LiqPayStore = {
  events: [],
  subscriptions: {},
  manageTokens: [],
};

const readStore = async (): Promise<LiqPayStore> => {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as LiqPayStore;
  } catch {
    return DEFAULT_STORE;
  }
};

const writeStore = async (store: LiqPayStore): Promise<void> => {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const resolveEmailForOrder = (
  store: LiqPayStore,
  orderId: string,
  fallbackEmail: string | undefined
): string | undefined => {
  const normalizedFallback = normalizeEmail(String(fallbackEmail ?? ''));
  if (normalizedFallback) {
    return normalizedFallback;
  }

  const existing = normalizeEmail(String(store.subscriptions[orderId]?.email ?? ''));
  if (existing) {
    return existing;
  }

  for (const event of store.events) {
    const eventOrderId = String(event.payment.order_id ?? '');
    if (eventOrderId !== orderId) continue;
    const senderEmail = normalizeEmail(String(event.payment.sender_email ?? ''));
    if (senderEmail) return senderEmail;
  }

  return undefined;
};

export const saveCallbackEvent = async (
  event: StoredCallbackEvent
): Promise<StoredCallbackEvent> => {
  const store = await readStore();

  store.events.unshift(event);
  if (store.events.length > 200) {
    store.events = store.events.slice(0, 200);
  }

  const action = String(event.payment.action ?? '');
  const orderId = String(event.payment.order_id ?? '');
  if (orderId && (action === 'subscribe' || action === 'regular' || action === 'unsubscribe')) {
    const resolvedEmail = resolveEmailForOrder(
      store,
      orderId,
      (event.payment.sender_email as string | undefined) ?? undefined
    );

    store.subscriptions[orderId] = {
      orderId,
      status: String(event.payment.status ?? 'unknown'),
      action,
      amount: (event.payment.amount as string | number | undefined) ?? undefined,
      currency: (event.payment.currency as string | undefined) ?? undefined,
      subscribeId: (event.payment.subscribe_id as string | undefined) ?? undefined,
      customer: (event.payment.customer as string | undefined) ?? undefined,
      email: resolvedEmail,
      lastUpdateAt: event.receivedAt,
      payload: event.payment,
    };
  }

  await writeStore(store);
  return event;
};

export const getLiqPayStore = async (): Promise<LiqPayStore> => {
  return readStore();
};

export const getSubscriptionsByEmail = async (emailRaw: string): Promise<StoredSubscription[]> => {
  const email = normalizeEmail(emailRaw);
  if (!email) {
    return [];
  }

  const store = await readStore();
  return Object.values(store.subscriptions)
    .filter(sub => normalizeEmail(sub.email ?? '') === email)
    .sort((a, b) => (a.lastUpdateAt < b.lastUpdateAt ? 1 : -1));
};

export const getSubscriptionOrderIdsByEmailFromEvents = async (emailRaw: string): Promise<string[]> => {
  const email = normalizeEmail(emailRaw);
  if (!email) {
    return [];
  }

  const store = await readStore();
  const orderIds = new Set<string>();

  for (const event of store.events) {
    const payment = event.payment;
    const senderEmail = normalizeEmail(String(payment.sender_email ?? ''));
    if (senderEmail !== email) continue;

    const orderId = String(payment.order_id ?? '').trim();
    if (!orderId) continue;

    const action = String(payment.action ?? '');
    const mode = String(payment.mode ?? '');
    const outgoingAction = String(payment.outgoing_action ?? '');
    const subscribeId = String(payment.subscribe_id ?? '');

    const looksLikeSubscription =
      action === 'subscribe' ||
      action === 'regular' ||
      action === 'unsubscribe' ||
      (action === 'checkout_init' && (mode === 'subscribe' || outgoingAction === 'subscribe')) ||
      Boolean(subscribeId);

    if (looksLikeSubscription) {
      orderIds.add(orderId);
    }
  }

  return Array.from(orderIds);
};

export const createManageTokenForEmail = async (
  emailRaw: string
): Promise<{ token: string; expiresAt: string } | null> => {
  const email = normalizeEmail(emailRaw);
  if (!email) {
    return null;
  }

  const store = await readStore();
  const hasSubscriptions = Object.values(store.subscriptions).some(sub => normalizeEmail(sub.email ?? '') === email);
  if (!hasSubscriptions) {
    return null;
  }

  const now = Date.now();
  const expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  const token = `${Date.now().toString(36)}_${randomBytes(24).toString('hex')}`;

  store.manageTokens.unshift({
    token,
    email,
    createdAt: new Date(now).toISOString(),
    expiresAt,
  });

  if (store.manageTokens.length > 200) {
    store.manageTokens = store.manageTokens.slice(0, 200);
  }

  await writeStore(store);
  return { token, expiresAt };
};

export const getSubscriptionsByManageToken = async (
  tokenRaw: string
): Promise<{ email: string; subscriptions: StoredSubscription[] } | null> => {
  const token = tokenRaw.trim();
  if (!token) {
    return null;
  }

  const store = await readStore();
  const tokenEntry = store.manageTokens.find(item => item.token === token);
  if (!tokenEntry) {
    return null;
  }

  const now = Date.now();
  const expiresTs = Date.parse(tokenEntry.expiresAt);
  if (Number.isNaN(expiresTs) || expiresTs < now) {
    return null;
  }

  const subscriptions = Object.values(store.subscriptions)
    .filter(sub => normalizeEmail(sub.email ?? '') === tokenEntry.email)
    .sort((a, b) => (a.lastUpdateAt < b.lastUpdateAt ? 1 : -1));

  return {
    email: tokenEntry.email,
    subscriptions,
  };
};
