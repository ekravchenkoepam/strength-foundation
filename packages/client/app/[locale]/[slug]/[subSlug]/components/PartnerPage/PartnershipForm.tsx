'use client';

import { FormEvent, useState } from 'react';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

type PartnershipFormProps = {
  locale: string;
};

const PARTNERSHIP_FORM_TRANSLATIONS = {
  uk: {
    headingLine1: 'Залиште свій запит — і наш спеціаліст',
    headingLine2: 'зв’яжеться з вами найближчим часом.',
    name: 'Ім’я*',
    namePlaceholder: 'Введіть ваше ім’я',
    phone: 'Номер телефону*',
    email: 'Електронна адреса*',
    message: 'Короткий опис запиту',
    messagePlaceholder: 'Текст',
    consent: 'Даю згоду на обробку і використання персональних даних згідно з законодавством України*',
    submit: 'Надіслати запит',
    submitting: 'Надсилання...',
    success: 'Дякуємо! Ваш запит надіслано.',
    error: 'Не вдалося надіслати запит. Спробуйте ще раз.',
  },
  en: {
    headingLine1: 'Leave your request — and our specialist',
    headingLine2: 'will contact you as soon as possible.',
    name: 'Name*',
    namePlaceholder: 'Enter your name',
    phone: 'Phone number*',
    email: 'Email address*',
    message: 'Brief description of your request',
    messagePlaceholder: 'Text',
    consent: 'I consent to the processing and use of my personal data in accordance with Ukrainian law*',
    submit: 'Send request',
    submitting: 'Sending...',
    success: 'Thank you! Your request has been sent.',
    error: 'Failed to send the request. Please try again.',
  },
} as const;

const inputClassName = [
  'mt-2 h-[54px] w-full rounded-[10px] border border-[var(--black-20)] bg-white px-4',
  'text-[14px] font-normal text-[var(--black-100)] outline-none',
  'placeholder:text-[var(--black-40)] focus:border-[var(--yellow-100)]',
  'focus:ring-2 focus:ring-[var(--yellow-40)]',
].join(' ');

const formClassName = [
  'min-h-[720px] rounded-[10px] bg-[var(--white-100)] px-[18px] pb-7 pt-7',
  'text-[var(--black-100)] sm:min-h-[770px] sm:px-6 sm:pb-9 sm:pt-9',
].join(' ');

const submitButtonClassName = [
  'mt-[38px] min-h-[52px] min-w-[209px] rounded-[10px] bg-[var(--yellow-100)]',
  'px-[30px] py-3 text-[14px] font-bold leading-5 text-[var(--black-100)]',
  'transition-colors hover:bg-[var(--yellow-80)]',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

export const PartnershipForm = ({ locale }: PartnershipFormProps) => {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const translations = PARTNERSHIP_FORM_TRANSLATIONS[locale === 'en' ? 'en' : 'uk'];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('submitting');
    setStatusMessage('');

    try {
      const response = await fetch('/api/partnership-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          message: formData.get('message'),
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
        }),
      });

      if (!response.ok) {
        throw new Error(translations.error);
      }

      form.reset();
      setStatus('success');
      setStatusMessage(translations.success);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : translations.error);
    }
  };

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      <h3 className="mb-12 max-w-[590px] text-[16px] font-bold uppercase leading-[18px]">
        {translations.headingLine1}
        <br className="hidden sm:block" /> {translations.headingLine2}
      </h3>

      <div className="space-y-5">
        <label className="block text-[16px] font-medium leading-5">
          {translations.name}
          <input
            className={inputClassName}
            name="name"
            placeholder={translations.namePlaceholder}
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
          />
        </label>

        <label className="block text-[16px] font-medium leading-5">
          {translations.phone}
          <input
            className={inputClassName}
            name="phone"
            placeholder="+38 0XX XXX XX XX"
            type="tel"
            autoComplete="tel"
            maxLength={50}
            required
          />
        </label>

        <label className="block text-[16px] font-medium leading-5">
          {translations.email}
          <input
            className={inputClassName}
            name="email"
            placeholder="Example@example.com"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>

        <label className="block text-[16px] font-medium leading-5">
          {translations.message}
          <textarea
            className={`${inputClassName} h-[134px] resize-none py-3`}
            name="message"
            placeholder={translations.messagePlaceholder}
            maxLength={2000}
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-3 text-[12px] font-normal leading-[18px] text-[var(--black-60)]">
        <input
          className="mt-[2px] h-[18px] w-[18px] shrink-0 accent-[var(--yellow-100)]"
          name="consent"
          type="checkbox"
          required
        />
        <span>{translations.consent}</span>
      </label>

      <input
        className="absolute h-px w-px overflow-hidden opacity-0"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button className={submitButtonClassName} type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? translations.submitting : translations.submit}
      </button>

      {statusMessage ? (
        <p
          className={`mt-3 text-[13px] leading-5 ${status === 'error' ? 'text-red-700' : 'text-[var(--green-100)]'}`}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
};
