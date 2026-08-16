'use client';

import { FormEvent, useState } from 'react';

import type { PartnershipRequestFormContent } from '../usePartnershipPageContent';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

type PartnershipFormProps = {
  content: PartnershipRequestFormContent;
};

const inputClassName = [
  'peer mt-2 h-[54px] w-full rounded-[10px] border border-transparent bg-white px-4',
  'text-[14px] font-normal text-[var(--black-100)] outline-none',
  'placeholder:text-[var(--black-40)] transition-colors',
  'focus:border-[var(--yellow-100)]',
  'user-invalid:border-[#c43838] user-invalid:focus:border-[#c43838]',
  'disabled:cursor-not-allowed disabled:bg-[var(--black-20)] disabled:text-[var(--black-40)]',
].join(' ');

const fieldErrorClassName = ['mt-1 hidden text-[12px] leading-4 text-[#c43838]', 'peer-user-invalid:block'].join(' ');

const formClassName = [
  'min-h-[720px] rounded-[10px] bg-[var(--white-80)] px-[18px] pb-7 pt-7',
  'text-[var(--black-100)] sm:min-h-[770px] sm:px-6 sm:pb-9 sm:pt-9',
].join(' ');

const submitButtonClassName = [
  'mt-[38px] min-h-[52px] min-w-[209px] rounded-[10px] bg-[var(--yellow-100)]',
  'px-[30px] py-3 text-[14px] font-bold leading-5 text-[var(--black-100)]',
  'transition-colors hover:bg-[var(--yellow-80)]',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

export const PartnershipForm = ({ content }: PartnershipFormProps) => {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

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
        throw new Error(content.errorMessage);
      }

      form.reset();
      setStatus('success');
      setStatusMessage(content.successMessage);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : content.errorMessage);
    }
  };

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      <h3 className="mb-12 max-w-[590px] whitespace-pre-line text-[16px] font-bold uppercase leading-[18px]">
        {content.heading}
      </h3>

      <div className="space-y-5">
        <label className="block text-[16px] font-medium leading-5">
          {content.nameLabel}
          <input
            className={inputClassName}
            name="name"
            placeholder={content.namePlaceholder}
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
          />
          <span className={fieldErrorClassName}>{content.fieldErrorMessage}</span>
        </label>

        <label className="block text-[16px] font-medium leading-5">
          {content.phoneLabel}
          <input
            className={inputClassName}
            name="phone"
            placeholder={content.phonePlaceholder}
            type="tel"
            autoComplete="tel"
            maxLength={50}
            required
          />
          <span className={fieldErrorClassName}>{content.fieldErrorMessage}</span>
        </label>

        <label className="block text-[16px] font-medium leading-5">
          {content.emailLabel}
          <input
            className={inputClassName}
            name="email"
            placeholder={content.emailPlaceholder}
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
          <span className={fieldErrorClassName}>{content.fieldErrorMessage}</span>
        </label>

        <label className="block text-[16px] font-medium leading-5">
          {content.messageLabel}
          <textarea
            className={`${inputClassName} h-[134px] resize-none py-3`}
            name="message"
            placeholder={content.messagePlaceholder}
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
        <span>{content.consentText}</span>
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
        {status === 'submitting' ? content.submittingLabel : content.submitLabel}
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
