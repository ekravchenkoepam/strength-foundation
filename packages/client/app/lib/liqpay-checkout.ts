import { createLiqPayData, createLiqPaySignature } from '@/app/lib/liqpay';

type CheckoutBody = {
  amount?: number;
  email?: string;
  locale?: string;
  mode?: 'pay' | 'subscribe';
  periodicity?: 'month' | 'year';
  subscribeDateStart?: string;
};

type BuildCheckoutParams = {
  body: CheckoutBody;
  origin: string;
  publicKey: string;
  privateKey: string;
};

const formatLiqPayDate = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const buildLiqPayCheckout = ({
  body,
  origin,
  publicKey,
  privateKey,
}: BuildCheckoutParams) => {
  const amount = Number(body.amount ?? 100);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const locale = body.locale === 'en' ? 'en' : 'uk';
  const mode = body.mode === 'subscribe' ? 'subscribe' : 'pay';
  const senderEmail = String(body.email ?? '').trim();
  const periodicity = body.periodicity === 'year' ? 'year' : 'month';
  const publicBaseUrl = (process.env.LIQPAY_PUBLIC_BASE_URL || origin).replace(/\/$/, '');
  const orderId = `poc_${Date.now()}`;

  if (mode === 'subscribe' && !senderEmail) {
    throw new Error('Email is required for subscription management');
  }

  const payload: Record<string, string | number> = {
    version: 3,
    public_key: publicKey,
    action: mode,
    amount: Number(amount.toFixed(2)),
    currency: 'UAH',
    description: mode === 'subscribe' ? 'Регулярний внесок (PoC)' : 'Разовий внесок (PoC)',
    order_id: orderId,
    language: locale,
    result_url: `${publicBaseUrl}/${locale}/donate?status=success&order=${orderId}&mode=${mode}`,
    server_url: `${publicBaseUrl}/api/liqpay/callback`,
  };

  if (senderEmail) {
    payload.sender_email = senderEmail;
  }

  if (mode === 'subscribe') {
    payload.subscribe = '1';
    payload.subscribe_periodicity = periodicity;
    const defaultStart = formatLiqPayDate(new Date(Date.now() + 60 * 1000));
    payload.subscribe_date_start = body.subscribeDateStart || defaultStart;
  }

  const data = createLiqPayData(payload);
  const signature = createLiqPaySignature(data, privateKey);

  return {
    checkoutUrl: 'https://www.liqpay.ua/api/3/checkout',
    data,
    signature,
    orderId,
    mode,
    periodicity,
    amount: Number(amount.toFixed(2)),
    senderEmail: senderEmail || null,
    publicBaseUrl,
    subscribeDateStart: mode === 'subscribe' ? String(payload.subscribe_date_start ?? '') : null,
  };
};
