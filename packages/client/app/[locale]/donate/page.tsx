'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { Breadcrumbs } from '@/app/components/shared';
import { AVAILABLE_CURRENCIES, DEFAULT_CURRENCY, type LiqPayCurrency } from '@/app/lib/liqpay-currencies';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { getDonateTranslations } from './i18n';
import styles from './page.module.scss';

type CheckoutResponse = {
  checkoutUrl: string;
  data: string;
  signature: string;
  orderId: string;
  error?: string;
};

type CheckoutMode = 'pay' | 'subscribe';

type SubscriberCountResponse = {
  count?: number;
};

const presetAmounts = [100, 200, 500, 1000];

export default function DonatePage() {
  const { locale } = useParams<{ locale: string }>();
  const t = getDonateTranslations(locale);
  const searchParams = useSearchParams();
  const externalFormRef = useRef<HTMLFormElement>(null);
  const checkoutDataRef = useRef<HTMLInputElement>(null);
  const checkoutSignatureRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<CheckoutMode>('pay');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<LiqPayCurrency>(DEFAULT_CURRENCY);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [supporterCount, setSupporterCount] = useState<number | null>(null);

  const isSuccess = searchParams.get('status') === 'success';
  const formattedSupporterCount =
    supporterCount === null ? '—' : new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'uk-UA').format(supporterCount);
  const supporterPluralCategory = new Intl.PluralRules(locale === 'en' ? 'en-US' : 'uk-UA').select(supporterCount ?? 0);
  const supporterPrefix = t.supporterPrefix[supporterPluralCategory] ?? t.supporterPrefix.other;
  const supporterNoun = t.supporterNoun[supporterPluralCategory] ?? t.supporterNoun.other;
  const supporterAriaLabel = t.supporterAriaLabel
    .replace('{prefix}', supporterPrefix)
    .replace('{count}', formattedSupporterCount)
    .replace('{noun}', supporterNoun);

  useEffect(() => {
    const controller = new AbortController();

    const loadSupporterCount = async () => {
      try {
        const response = await fetch('/api/subscriptions/count', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = (await response.json()) as SubscriberCountResponse;

        if (response.ok && Number.isInteger(payload.count) && Number(payload.count) >= 0) {
          setSupporterCount(Number(payload.count));
        }
      } catch (countError) {
        if (!(countError instanceof DOMException && countError.name === 'AbortError')) {
          console.error('Failed to load active subscriber count', countError);
        }
      }
    };

    void loadSupporterCount();

    return () => controller.abort();
  }, []);

  const selectMode = (nextMode: CheckoutMode) => {
    setMode(nextMode);
    setError('');
  };

  const addPresetAmount = (preset: number) => {
    setAmount(currentAmount => {
      const parsedAmount = Number(currentAmount);
      const baseAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

      return String(baseAmount + preset);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t.amountValidationError);
      return;
    }

    if (mode === 'subscribe' && !email.trim()) {
      setError(t.emailValidationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/liqpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          periodicity: 'month',
          amount: parsedAmount,
          currency,
          email: email.trim() || undefined,
          locale: locale ?? 'uk',
        }),
      });

      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok || !payload.data || !payload.signature || payload.error) {
        throw new Error(payload.error || t.prepareCheckoutError);
      }

      const checkoutForm = externalFormRef.current;
      const checkoutData = checkoutDataRef.current;
      const checkoutSignature = checkoutSignatureRef.current;

      if (!checkoutForm || !checkoutData || !checkoutSignature) {
        throw new Error(t.prepareCheckoutError);
      }

      checkoutForm.action = payload.checkoutUrl;
      checkoutData.value = payload.data;
      checkoutSignature.value = payload.signature;
      checkoutForm.submit();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.startCheckoutError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        locale={locale ?? 'uk'}
        breadcrumbs={[
          { href: '/', title: t.homeBreadcrumb },
          { href: 'donate', title: t.donateBreadcrumb },
        ]}
      />

      <main className={styles.page}>
        <div className={styles.pageContainer}>
          <h1 className={styles.pageTitle}>{t.title}</h1>
          <p className={styles.pageIntro}>{t.intro}</p>

          <section className={styles.donationPanel} aria-labelledby="liqpay-title">
            <div className={styles.fundsNotice}>
              <span className={styles.noticeIcon} aria-hidden="true">
                ℹ️
              </span>
              <div className={styles.noticeContent}>
                <h2 className={styles.noticeTitle}>{t.fundsTitle}</h2>
                <p className={styles.noticeDescription} title={t.fundsDescription}>
                  {t.fundsDescription}
                </p>
              </div>
            </div>

            <h2 id="liqpay-title" className={styles.formTitle}>
              {t.liqpayTitle}
            </h2>

            {isSuccess && <div className={styles.successMessage}>{t.successMessage}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <fieldset className={styles.modeFieldset}>
                <legend className={styles.fieldLabel}>{t.periodicity}</legend>
                <div className={styles.modeSwitch}>
                  <button
                    type="button"
                    className={`${styles.modeButton} ${mode === 'pay' ? styles.modeButtonActive : ''}`}
                    onClick={() => selectMode('pay')}
                    aria-pressed={mode === 'pay'}
                  >
                    {t.oneTime}
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeButton} ${mode === 'subscribe' ? styles.modeButtonActive : ''}`}
                    onClick={() => selectMode('subscribe')}
                    aria-pressed={mode === 'subscribe'}
                  >
                    {t.subscription}
                  </button>
                </div>
              </fieldset>

              {mode === 'subscribe' && (
                <aside className={styles.subscriptionBenefit} aria-labelledby="subscription-benefit-title">
                  <div className={styles.subscriptionBenefitCopy}>
                    <span className={styles.noticeIcon} aria-hidden="true">
                      ℹ️
                    </span>
                    <div className={styles.noticeContent}>
                      <h3 id="subscription-benefit-title" className={styles.noticeTitle}>
                        {t.recurringBenefitTitle}
                      </h3>
                      <p className={styles.noticeDescription}>{t.recurringBenefitDescription}</p>
                    </div>
                  </div>

                  <div className={styles.supporterStat} aria-label={supporterAriaLabel} aria-live="polite">
                    <span>{supporterPrefix}</span>
                    <strong>{formattedSupporterCount}</strong>
                    <span>{supporterNoun}</span>
                  </div>
                </aside>
              )}

              <div className={styles.amountField}>
                <label className={styles.fieldLabel} htmlFor="amount">
                  {mode === 'subscribe' ? t.subscriptionAmountLabel : t.donationAmountLabel}
                </label>
                <div className={styles.amountControl}>
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder={t.amountPlaceholder}
                    value={amount}
                    onChange={event => setAmount(event.target.value)}
                    className={styles.amountInput}
                    required
                  />
                  <div className={styles.currencyControl}>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className={styles.currencyTrigger} aria-label={t.currencyLabel}>
                        <span>{AVAILABLE_CURRENCIES.find(option => option.code === currency)?.label}</span>
                        <ChevronDownIcon aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={styles.currencyMenu} align="end" sideOffset={8}>
                        <DropdownMenuRadioGroup
                          value={currency}
                          onValueChange={value => setCurrency(value as LiqPayCurrency)}
                        >
                          {AVAILABLE_CURRENCIES.map(option => (
                            <DropdownMenuRadioItem
                              className={styles.currencyOption}
                              key={option.code}
                              value={option.code}
                            >
                              {option.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className={styles.presetGrid} aria-label={t.quickAmountLabel}>
                {presetAmounts.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    className={styles.presetButton}
                    onClick={() => addPresetAmount(preset)}
                  >
                    +{preset} {currency}
                  </button>
                ))}
              </div>

              {mode === 'subscribe' && (
                <div className={styles.subscriptionEmailField}>
                  <label className={styles.fieldLabel} htmlFor="email">
                    {t.emailLabel}
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Example@example.com"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>
              )}

              {error && (
                <div className={styles.errorMessage} role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? t.submitLoading : t.submit}
              </button>

              <p className={styles.securityNote}>
                <span aria-hidden="true">🔒</span>
                {t.secureTransaction}
              </p>

              {mode === 'subscribe' && (
                <aside className={styles.subscriptionTerms} aria-labelledby="subscription-terms-title">
                  <span className={styles.noticeIcon} aria-hidden="true">
                    ℹ️
                  </span>
                  <div className={styles.noticeContent}>
                    <h3 id="subscription-terms-title" className={styles.noticeTitle}>
                      {t.subscriptionTermsTitle}
                    </h3>
                    <p className={styles.subscriptionTermsDescription}>{t.subscriptionTermsDescription}</p>
                  </div>
                </aside>
              )}
            </form>

            <form ref={externalFormRef} method="POST" action="https://www.liqpay.ua/api/3/checkout" hidden>
              <input ref={checkoutDataRef} type="hidden" name="data" />
              <input ref={checkoutSignatureRef} type="hidden" name="signature" />
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
