'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { PartnershipBlock as PartnershipBlockProps } from '../types';

export const PartnershipBlock = ({ title, items = [] }: PartnershipBlockProps) => {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <h2 className="m-0 text-center text-[26px] font-bold text-[var(--black-100)] md:text-3xl">{title}</h2>

      <div className="flex flex-col gap-4 rounded-[18px] bg-white p-[18px] shadow-[0_18px_40px_rgba(0,0,0,0.06)] md:p-[20px]">
        {items.map(item => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={clsx(
                'overflow-hidden rounded-[var(--border-radius)] border-2 border-[var(--yellow-60)] bg-[var(--white-100)]'
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={clsx(
                  'flex h-[90px] w-full cursor-pointer appearance-none items-center justify-between border-0 px-4 text-left font-inherit',
                  'md:px-5',
                  isOpen ? 'rounded-b-none bg-[var(--yellow-60)]' : 'bg-[var(--white-100)]'
                )}
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold text-[var(--black-100)] md:text-[18px]">{item.title}</span>
                <img
                  src={isOpen ? '/images/arrow-up.svg' : '/images/arrow-down.svg'}
                  alt={isOpen ? 'Collapse' : 'Expand'}
                  className="mr-[15px]"
                />
              </button>
              {isOpen ? (
                <div
                  className="border-2 border-t-0
                border-[var(--yellow-60)] bg-[var(--white-100)] px-4 py-5 text-sm
                leading-[1.55] whitespace-pre-line text-[var(--black-100)] md:px-6"
                >
                  {item.description}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};
