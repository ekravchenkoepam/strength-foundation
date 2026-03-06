'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type SubscriptionItem = {
  orderId: string;
  status: string;
  action?: string;
  amount: string | number | null;
  currency: string | null;
  periodicity: string;
  lastUpdateAt: string;
};

type ManageResponse = {
  ok?: boolean;
  error?: string;
  email?: string;
  subscriptions?: SubscriptionItem[];
};

export default function DonateManagePage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => String(searchParams.get('token') ?? '').trim(), [searchParams]);

  const [email, setEmail] = useState('');
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingOrderId, setCancelingOrderId] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      setError('Missing token');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/liqpay/subscriptions/manage?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as ManageResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to load subscriptions');
      }

      setEmail(payload.email ?? '');
      setItems(payload.subscriptions ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load subscriptions');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancelSubscription = async (orderId: string) => {
    setCancelingOrderId(orderId);
    setError('');

    try {
      const response = await fetch('/api/liqpay/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to cancel subscription');
      }

      await load();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Failed to cancel subscription');
    } finally {
      setCancelingOrderId('');
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#4a4d39] px-4 py-8 sm:px-6">
      <div className="w-full max-w-[680px] rounded-[12px] bg-[#f3f3f1] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:p-7">
        <h1 className="font-[var(--font-e-ukraine-head)] text-[28px] uppercase text-[#151515]">Керування підписками</h1>
        {email && <p className="mt-2 text-[#545454]">Email: {email}</p>}

        {loading && <p className="mt-5 text-[#3a3a3a]">Завантаження...</p>}
        {error && <div className="mt-4 rounded-[10px] border border-[#c43838] bg-[#fff0f0] px-3 py-2.5 text-sm text-[#7f2020]">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <p className="mt-5 text-[#3a3a3a]">Активні підписки не знайдені.</p>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {items.map(item => {
            const unsubscribed = item.action === 'unsubscribe';
            return (
              <div key={item.orderId} className="rounded-[10px] border border-[#d0d0d0] bg-[#ededeb] p-4 text-[#242424]">
                <div>order_id: {item.orderId}</div>
                <div>status: {item.status}</div>
                <div>periodicity: {item.periodicity || 'n/a'}</div>
                <div>
                  amount: {item.amount ?? 'n/a'} {item.currency ?? ''}
                </div>
                <div>updated: {item.lastUpdateAt}</div>
                <button
                  type="button"
                  className="mt-3 h-11 rounded-[10px] border border-[#6b6b6b] bg-[#f8f8f8] px-4 text-base text-[#242424] transition-colors hover:bg-[#ececec] disabled:opacity-60"
                  onClick={() => void cancelSubscription(item.orderId)}
                  disabled={unsubscribed || cancelingOrderId === item.orderId}
                >
                  {unsubscribed
                    ? 'Вже скасована'
                    : cancelingOrderId === item.orderId
                      ? 'Скасовуємо...'
                      : 'Скасувати підписку'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
