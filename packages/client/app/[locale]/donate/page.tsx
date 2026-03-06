'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type CheckoutResponse = {
  checkoutUrl: string;
  data: string;
  signature: string;
  orderId: string;
  error?: string;
};

type CheckoutMode = 'pay' | 'subscribe';
type Periodicity = 'month' | 'year';

type LiqPayStoreResponse = {
  events: Array<{
    id: string;
    receivedAt: string;
    payment: Record<string, string | number | boolean | null>;
  }>;
  subscriptions: Record<
    string,
    {
      orderId: string;
      status: string;
      action?: string;
      lastUpdateAt: string;
    }
  >;
};

type CancelResponse = {
  ok?: boolean;
  error?: string;
  orderId?: string | null;
};

type CancelByEmailResponse = {
  ok?: boolean;
  error?: string;
  cancelled?: string[];
  failed?: Array<{ orderId: string; error: string }>;
  totalFound?: number;
};

const labelClass = 'text-sm leading-[18px] text-[var(--black-80)]';
const inputClass =
  'h-[52px] w-full rounded-[10px] border border-transparent bg-[#e4e4e4] px-4 text-[18px] text-[#1d1d1d] outline-none placeholder:text-[#767676] focus:border-[#b7b7b7]';
const messageSuccessClass =
  'mb-4 rounded-[10px] border border-[#6f9e58] bg-[#eef8e8] px-3 py-2.5 text-sm text-[#244116]';
const messageErrorClass =
  'mt-1.5 rounded-[10px] border border-[#c43838] bg-[#fff0f0] px-3 py-2.5 text-sm text-[#7f2020]';

const getEventKind = (payment: Record<string, string | number | boolean | null>): string => {
  const action = String(payment.action ?? '');
  const mode = String(payment.mode ?? '');
  const type = String(payment.type ?? '');
  const subscribeId = String(payment.subscribe_id ?? '');

  if (action === 'checkout_init' && mode === 'subscribe') return 'subscription intent';
  if (action === 'checkout_init' && mode === 'pay') return 'one-time intent';
  if (action === 'regular') return 'subscription charge';
  if (action === 'subscribe' || subscribeId) return 'subscription created';
  if (action === 'pay' || type === 'buy') return 'one-time payment';
  return 'unknown';
};

export default function DonatePage() {
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const externalFormRef = useRef<HTMLFormElement>(null);

  const [mode, setMode] = useState<CheckoutMode>('pay');
  const [periodicity, setPeriodicity] = useState<Periodicity>('month');
  const [amount, setAmount] = useState<number>(100);
  const [email, setEmail] = useState<string>('');
  const [cancelOrderId, setCancelOrderId] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');
  const [manageEmail, setManageEmail] = useState<string>('');
  const [manageError, setManageError] = useState<string>('');
  const [manageSuccess, setManageSuccess] = useState<string>('');
  const [isCancelingByEmail, setIsCancelingByEmail] = useState<boolean>(false);
  const [store, setStore] = useState<LiqPayStoreResponse | null>(null);
  const [storeError, setStoreError] = useState<string>('');

  const status = searchParams.get('status');
  const order = searchParams.get('order');
  const modeFromQuery = searchParams.get('mode');
  const isSuccess = status === 'success';

  const loadEvents = useCallback(async () => {
    try {
      setStoreError('');
      const response = await fetch('/api/liqpay/events', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load events: HTTP ${response.status}`);
      }
      const payload = (await response.json()) as LiqPayStoreResponse;
      setStore(payload);
    } catch (loadError) {
      setStoreError(loadError instanceof Error ? loadError.message : 'Failed to load events');
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!isSuccess || !order) return;

    const syncStatus = async () => {
      try {
        await fetch(`/api/liqpay/status?orderId=${encodeURIComponent(order)}`, { cache: 'no-store' });
      } catch {
        // Keep UI resilient even if status sync fails.
      } finally {
        await loadEvents();
      }
    };

    void syncStatus();
  }, [isSuccess, order, loadEvents]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'subscribe' && !email.trim()) {
        throw new Error('Email is required for subscription management');
      }

      const response = await fetch('/api/liqpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          periodicity,
          amount,
          email: email || undefined,
          locale: locale ?? 'uk',
        }),
      });

      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok || !payload.data || !payload.signature || payload.error) {
        throw new Error(payload.error || 'Failed to prepare checkout form');
      }

      setData(payload.data);
      setSignature(payload.signature);

      requestAnimationFrame(() => {
        externalFormRef.current?.submit();
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to start payment';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCancelError('');
    setCancelSuccess('');
    setIsCanceling(true);

    try {
      if (!cancelOrderId.trim()) {
        throw new Error('Вкажіть order_id (poc_...)');
      }

      const response = await fetch('/api/liqpay/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cancelOrderId || undefined,
        }),
      });

      const payload = (await response.json()) as CancelResponse;
      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to cancel subscription');
      }

      const successId = payload.orderId || cancelOrderId;
      setCancelSuccess(`Підписка скасована: ${successId}`);
      setCancelOrderId('');
      await loadEvents();
    } catch (cancelRequestError) {
      const message =
        cancelRequestError instanceof Error ? cancelRequestError.message : 'Failed to cancel subscription';
      setCancelError(message);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleCancelByEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setManageError('');
    setManageSuccess('');
    setIsCancelingByEmail(true);

    try {
      const emailToUse = (manageEmail || email).trim();
      if (!emailToUse) {
        throw new Error('Вкажіть email для скасування підписки');
      }

      const response = await fetch('/api/liqpay/subscriptions/cancel-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
        }),
      });

      const payload = (await response.json()) as CancelByEmailResponse;
      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to cancel subscriptions');
      }

      const cancelledCount = payload.cancelled?.length ?? 0;
      const failedCount = payload.failed?.length ?? 0;
      setManageSuccess(`Скасовано: ${cancelledCount}. Помилок: ${failedCount}.`);
      await loadEvents();
    } catch (requestError) {
      setManageError(requestError instanceof Error ? requestError.message : 'Failed to cancel subscriptions');
    } finally {
      setIsCancelingByEmail(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#4a4d39] px-4 py-8 sm:px-6">
      <div className="w-full max-w-[560px] rounded-[12px] bg-[#f3f3f1] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:p-7">
        <h1 className="font-[var(--font-e-ukraine-head)] text-[29px] leading-[32px] uppercase tracking-[-0.02em] text-[#151515] sm:text-[34px] sm:leading-[38px]">
          Підтримка через LiqPay
        </h1>
        <p className="mb-5 mt-2 text-[15px] text-[#525252]">PoC інтеграції LiqPay (sandbox)</p>

        {isSuccess && (
          <div className={messageSuccessClass}>
            Повернення з LiqPay отримано. order_id: {order ?? 'n/a'}, mode: {modeFromQuery ?? 'n/a'}.
          </div>
        )}

        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
          <div className="mb-1 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className={
                mode === 'pay'
                  ? 'h-11 rounded-[10px] border border-[#2c2c2c] bg-[#ffffff] text-[17px] font-medium text-[#1c1c1c]'
                  : 'h-11 rounded-[10px] border border-transparent bg-[#dddddd] text-[17px] font-medium text-[#676767]'
              }
              onClick={() => setMode('pay')}
            >
              Разово
            </button>
            <button
              type="button"
              className={
                mode === 'subscribe'
                  ? 'h-11 rounded-[10px] border border-[#2c2c2c] bg-[#ffffff] text-[17px] font-medium text-[#1c1c1c]'
                  : 'h-11 rounded-[10px] border border-transparent bg-[#dddddd] text-[17px] font-medium text-[#676767]'
              }
              onClick={() => setMode('subscribe')}
            >
              Підписка
            </button>
          </div>

          {mode === 'subscribe' && (
            <>
              <label className={labelClass} htmlFor="periodicity">
                Періодичність
              </label>
              <select
                id="periodicity"
                value={periodicity}
                onChange={event => setPeriodicity(event.target.value as Periodicity)}
                className={inputClass}
              >
                <option value="month">Щомісяця</option>
                <option value="year">Щороку</option>
              </select>
            </>
          )}

          <label className={labelClass} htmlFor="amount">
            {mode === 'subscribe' ? 'Сума підписки (UAH)' : 'Сума внеску (UAH)'}
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={event => setAmount(Number(event.target.value))}
            required
            className={inputClass}
          />

          <label className={labelClass} htmlFor="email">
            {mode === 'subscribe' ? 'Email (required for subscription management)' : 'Email (optional)'}
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@example.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className={inputClass}
            required={mode === 'subscribe'}
          />

          {error && <div className={messageErrorClass}>{error}</div>}

          <button
            type="submit"
            className="mt-4 h-[54px] rounded-[10px] border-0 bg-[#e2bd35] px-5 text-[26px] font-[var(--font-e-ukraine-head)] uppercase text-[#171717] transition-colors hover:bg-[#d6b12a] disabled:opacity-60 sm:text-[28px]"
            disabled={isLoading}
          >
            {isLoading ? 'Створюємо оплату...' : mode === 'subscribe' ? 'Оформити підписку' : 'Підтримати разово'}
          </button>
        </form>

        <div className="my-5 h-px bg-[#d3d3d3]" />

        <form className="flex flex-col gap-2.5" onSubmit={handleCancelSubscription}>
          <h2 className="text-lg leading-6 text-[#161616]">Скасувати підписку</h2>
          <label className={labelClass} htmlFor="cancelOrderId">
            order_id підписки (наприклад, poc_...)
          </label>
          <input
            id="cancelOrderId"
            type="text"
            value={cancelOrderId}
            onChange={event => setCancelOrderId(event.target.value)}
            className={inputClass}
            required
          />
          {cancelError && <div className={messageErrorClass}>{cancelError}</div>}
          {cancelSuccess && <div className={messageSuccessClass}>{cancelSuccess}</div>}
          <button
            type="submit"
            className="mt-1.5 h-12 rounded-[10px] border border-[#6b6b6b] bg-[#f8f8f8] text-base text-[#242424] transition-colors hover:bg-[#ececec]"
            disabled={isCanceling}
          >
            {isCanceling ? 'Скасовуємо...' : 'Скасувати підписку'}
          </button>
        </form>

        <div className="my-5 h-px bg-[#d3d3d3]" />

        <form className="flex flex-col gap-2.5" onSubmit={handleCancelByEmail}>
          <h2 className="text-lg leading-6 text-[#161616]">Скасувати підписку за email</h2>
          <label className={labelClass} htmlFor="manageEmail">
            Email підписника
          </label>
          <input
            id="manageEmail"
            type="email"
            value={manageEmail}
            onChange={event => setManageEmail(event.target.value)}
            className={inputClass}
            placeholder={email || 'example@example.com'}
          />
          {manageError && <div className={messageErrorClass}>{manageError}</div>}
          {manageSuccess && <div className={messageSuccessClass}>{manageSuccess}</div>}
          <button
            type="submit"
            className="mt-1.5 h-12 rounded-[10px] border border-[#6b6b6b] bg-[#f8f8f8] text-base text-[#242424] transition-colors hover:bg-[#ececec]"
            disabled={isCancelingByEmail}
          >
            {isCancelingByEmail ? 'Скасовуємо...' : 'Скасувати підписки за email'}
          </button>
        </form>

        <div className="my-5 h-px bg-[#d3d3d3]" />

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg leading-6 text-[#161616]">Callback статуси</h2>
          <button
            type="button"
            className="h-[34px] rounded-[9px] border border-[#8f8f8f] bg-[#f8f8f8] px-3 text-[13px] text-[#2f2f2f] transition-colors hover:bg-[#ececec]"
            onClick={() => void loadEvents()}
          >
            Оновити
          </button>
        </div>
        {storeError && <div className={messageErrorClass}>{storeError}</div>}

        <div className="flex flex-col gap-2.5">
          {(store?.events ?? []).slice(0, 8).map(eventItem => (
            <div
              key={eventItem.id}
              className="rounded-[10px] border border-[#d0d0d0] bg-[#ededeb] px-3 py-2.5 text-[13px] leading-[18px] text-[#2e2e2e]"
            >
              <div>type: {getEventKind(eventItem.payment)}</div>
              <div>time: {eventItem.receivedAt}</div>
              <div>action: {String(eventItem.payment.action ?? '')}</div>
              <div>status: {String(eventItem.payment.status ?? '')}</div>
              <div>order_id: {String(eventItem.payment.order_id ?? '')}</div>
              <div>amount: {String(eventItem.payment.amount ?? '')}</div>
              <div>mode: {String(eventItem.payment.mode ?? eventItem.payment.outgoing_action ?? '')}</div>
              <div>
                periodicity: {String(eventItem.payment.periodicity ?? eventItem.payment.subscribe_periodicity ?? '')}
              </div>
            </div>
          ))}
          {!store?.events?.length && <div className="text-sm text-[var(--black-60)]">Поки немає callback подій</div>}
        </div>

        <form ref={externalFormRef} method="POST" action="https://www.liqpay.ua/api/3/checkout" className="hidden">
          <input type="hidden" name="data" value={data} />
          <input type="hidden" name="signature" value={signature} />
        </form>
      </div>
    </main>
  );
}
