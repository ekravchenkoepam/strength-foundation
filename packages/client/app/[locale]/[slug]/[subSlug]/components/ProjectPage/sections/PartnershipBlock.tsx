'use client';

import { useState } from 'react';

import { PartnershipBlock as PartnershipBlockProps } from '../types';

export const PartnershipBlock = ({ title, items = [] }: PartnershipBlockProps) => {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <h2 className="m-0 text-center text-[26px] font-bold text-[var(--black-100)] md:text-3xl">{title}</h2>

      <div className="flex flex-col gap-[14px] rounded-[18px] bg-white p-[18px] shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
        {items.map(item => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-xl border-[1.5px] border-[var(--yellow-100,#f5cf3e)] ${
                isOpen ? 'bg-[rgba(245,207,62,0.18)]' : 'bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-[18px] py-[14px] text-left font-inherit"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold text-[var(--black-100)]">{item.title}</span>
                <span className="text-xs text-[var(--black-100)]" aria-hidden="true">
                  {isOpen ? '▴' : '▾'}
                </span>
              </button>
              {isOpen ? (
                <div className="px-[18px] pb-4 text-sm leading-[1.55] whitespace-pre-line text-[var(--black-100)]">
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
