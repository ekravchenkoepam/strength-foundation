import { TelegramIcon, ViberIcon, WhatsappIcon } from '@/app/components/icons';
import { Loading } from '@/app/components/shared';
import { useApp } from '@/app/context/AppContext';

import { usePartnerPageContent } from '../usePartnershipPageContent';
import { PartnershipForm } from './PartnershipForm';
import { PageProps } from '../../../types';

const contactChannelClassName = [
  'flex min-h-[72px] min-w-0 w-full flex-col-reverse items-center justify-center gap-2',
  'rounded-[14px] border border-white/20 bg-white/[0.08] px-1 py-3',
  'text-[11px] font-medium leading-4 tracking-[0.02em]',
  'transition-colors hover:border-white/35 hover:bg-white/[0.14]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow-100)]',
  '[&_svg]:size-5',
  'sm:min-h-[56px] sm:w-auto sm:min-w-[190px] sm:flex-row sm:gap-4 sm:rounded-full',
  'sm:bg-[var(--green-80)] sm:px-6 sm:py-[10px] sm:text-[16px] sm:leading-[var(--h10-line)]',
  'sm:tracking-normal sm:[&_svg]:size-6',
].join(' ');

const CONTACT_CHANNELS = [
  {
    id: 'telegram',
    label: 'TELEGRAM',
    Icon: TelegramIcon,
  },
  {
    id: 'viber',
    label: 'VIBER',
    Icon: ViberIcon,
  },
  {
    id: 'whatsapp',
    label: 'WHATSAPP',
    Icon: WhatsappIcon,
  },
];

export const PartnerPage = ({ locale }: PageProps) => {
  const { contacts } = useApp();
  const { data: content, isLoading } = usePartnerPageContent(locale);
  const phones = contacts?.phones?.filter(phone => phone.number.trim()) ?? [];
  const email = contacts?.email?.trim();

  if (isLoading) return <Loading />;
  if (!content) return null;

  return (
    <div className="w-full">
      <section className="bg-[var(--white-80)] pb-[52px] md:pb-[72px]">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h1 className="h1 pb-[30px] pt-6 text-center md:pb-12 md:pt-8">{content.title}</h1>

          <div className="h-[min(34vw,530px)] min-h-[260px] w-full rounded-[20px] bg-[#c4c4c4]" />

          <p className="mx-auto mt-7 max-w-[760px] whitespace-pre-line text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-12">
            {content.description}
          </p>
        </div>
      </section>

      <section className="border-b border-[var(--color-yellow)] bg-[var(--green-100)] pb-16 pt-16 text-[color:var(--white-100)] lg:pb-12 lg:pt-8">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h2 className="h2 mb-8 text-center md:mb-14 lg:mb-[72px]">{content.requestTitle}</h2>

          <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-2">
            <div className="flex h-full flex-col gap-10 lg:min-h-[770px] lg:justify-between lg:gap-0">
              <div>
                <div className="h9 mb-[28px] text-[color:var(--green-40)]">{content.alternativeChannelsTitle}</div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-[10px]">
                  {CONTACT_CHANNELS.map(({ id, label, Icon }) => (
                    <button key={id} className={contactChannelClassName} type="button">
                      <span>{label}</span>
                      <Icon width="24" height="24" color="#F5F5F5" backgroundColor="transparent" />
                    </button>
                  ))}
                </div>

                {(phones.length > 0 || email) && (
                  <>
                    <div className="my-[48px] border-b border-[var(--green-60)]" />

                    <div className="flex flex-col gap-5 md:flex-row md:gap-16">
                      {phones.length > 0 && (
                        <div>
                          <div className="h9 mb-[6px] text-[color:var(--green-40)]">{content.phoneLabel}</div>
                          <div className="flex flex-col">
                            {phones.map(phone => (
                              <a
                                key={phone.id}
                                className="text-[length:var(--h6-size)] leading-[var(--h6-line)]"
                                href={`tel:${phone.number.replace(/\s+/g, '')}`}
                              >
                                {phone.number}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {email && (
                        <div>
                          <div className="h9 mb-[6px] text-[color:var(--green-40)]">{content.emailLabel}</div>
                          <a className="text-[length:var(--h6-size)] leading-[var(--h6-line)]" href={`mailto:${email}`}>
                            {email}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <p className="whitespace-pre-line text-[14px] leading-[var(--h10-line)]">{content.privacyText}</p>
            </div>

            <PartnershipForm content={content.form} />
          </div>
        </div>
      </section>
    </div>
  );
};
