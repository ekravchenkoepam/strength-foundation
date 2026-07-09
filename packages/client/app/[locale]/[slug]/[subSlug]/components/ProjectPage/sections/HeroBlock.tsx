import { LiquidGlass } from '@/app/components/shared';
import { getStrapiMedia } from '@/app/utils/api-helpers';

import { HeroBlock as HeroBlockProps } from '../types';

export const HeroBlock = ({ title, image, caption, intro, quote }: HeroBlockProps) => {
  const imageUrl = image?.data?.attributes?.url;
  const imageAlt = image?.data?.attributes?.alternativeText || image?.data?.attributes?.name || title || '';

  return (
    <section className="flex w-full flex-col pb-[74px]">
      {title ? <h1 className="h1 m-0 text-center text-[var(--black-100)] mt-[32px] mb-[74px]">{title}</h1> : null}

      {imageUrl ? (
        <div className="grid w-full overflow-hidden rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          <img
            src={getStrapiMedia(imageUrl)}
            alt={imageAlt}
            className="col-start-1 row-start-1 block h-[300px] w-full object-cover md:h-[430px] lg:h-[640px]"
          />
          {caption ? (
            <LiquidGlass
              tint="dark"
              intensity="subtle"
              className="col-start-1 row-start-1 mr-[90px] mb-[66px] self-end justify-self-end rounded-[14px] p-[24px]"
            >
              <p className="m-0 text-[18px] leading-[1.3] font-semibold text-white">{caption}</p>
            </LiquidGlass>
          ) : null}
        </div>
      ) : null}

      {intro ? (
        <p className="mx-auto mt-[50px] mb-[74px] max-w-[820px] text-base leading-[1.55] text-[var(--black-100)] md:text-lg">
          {intro}
        </p>
      ) : null}

      {quote ? (
        <blockquote className="mx-auto flex w-full max-w-[820px] flex-col gap-3 rounded-2xl border-2 border-[var(--yellow-100,#f5cf3e)] bg-white p-7 md:p-9">
          <img src="/images/quotes.svg" alt="" className="h-[53px] w-[84px]" aria-hidden="true" />
          <p className="m-0 text-lg leading-[1.45] font-semibold text-[var(--black-100)] md:text-xl">{quote}</p>
        </blockquote>
      ) : null}
    </section>
  );
};
