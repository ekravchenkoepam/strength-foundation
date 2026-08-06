import { LiquidGlass } from '@/app/components/shared';
import { getStrapiMedia } from '@/app/utils/api-helpers';

import { SupportTypesBlock as SupportTypesBlockProps } from '../types';

export const SupportTypesBlock = ({ title, items = [] }: SupportTypesBlockProps) => (
  <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[var(--green-100)] bg-[url('/images/asphalt-bg-alt.png')] bg-cover bg-center px-6 pt-[100px] pb-[80px] md:pb-[100px] lg:px-[52px]">
    <div className="flex flex-col gap-8">
      <h2 className="m-0 text-center text-[26px] font-bold text-white md:text-[32px]">{title}</h2>

      <div className="grid grid-cols-1 gap-[32px] md:grid-cols-3">
        {items.map(item => {
          const iconUrl = item.icon?.data?.attributes?.url;
          return (
            <LiquidGlass
              key={item.id}
              tint="neutral"
              intensity="subtle"
              role="article"
              className="flex min-h-[130px] flex-col gap-[18px] rounded-[14px] p-[24px] pb-[74px]"
            >
              {iconUrl ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <img
                    src={getStrapiMedia(iconUrl)}
                    alt={item.icon?.data?.attributes?.alternativeText || ''}
                    className="h-6 w-6 object-contain"
                  />
                </div>
              ) : null}
              <h3 className="m-0 text-base font-semibold text-white">{item.title}</h3>
              {item.description ? (
                <p className="m-0 text-[14px] leading-[1.45] text-white">{item.description}</p>
              ) : null}
            </LiquidGlass>
          );
        })}
      </div>
    </div>
  </section>
);
