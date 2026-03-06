import { createHash } from 'crypto';

export type LiqPayPrimitive = string | number | boolean;
type LiqPayPayload = Record<string, LiqPayPrimitive>;

export const createLiqPayData = (payload: LiqPayPayload): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const createLiqPaySignature = (
  data: string,
  privateKey: string
): string => {
  return createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64');
};

export const decodeLiqPayData = <T = Record<string, unknown>>(data: string): T => {
  return JSON.parse(Buffer.from(data, 'base64').toString('utf8')) as T;
};

export const callLiqPayApi = async <T = Record<string, unknown>>(
  payload: LiqPayPayload,
  privateKey: string
): Promise<T> => {
  const data = createLiqPayData(payload);
  const signature = createLiqPaySignature(data, privateKey);

  const response = await fetch('https://www.liqpay.ua/api/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ data, signature }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`LiqPay API request failed: HTTP ${response.status}`);
  }

  return (await response.json()) as T;
};
