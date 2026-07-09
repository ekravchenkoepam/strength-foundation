import { getStrapiMedia } from '@/app/utils/api-helpers';

import { ContactsBlock as ContactsBlockProps } from '../types';

type ContactsBlockComponentProps = ContactsBlockProps & {
  locale: string;
};

export const ContactsBlock = ({
  title,
  channelsLabel,
  channels = [],
  phone,
  email,
  qrText,
  qrImage,
  qrButtonText,
  locale,
  footnote,
}: ContactsBlockComponentProps) => {
  const qrUrl = qrImage?.data?.attributes?.url;
  const donateHref = `/${locale}/donate`;

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[var(--green-100)] px-[52px] py-14 text-white md:py-[72px]">
      <div className="flex flex-col gap-[80px]">
        <h2 className="m-0 text-center text-[28px] font-bold md:text-[32px]">{title}</h2>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-9">
          <div className="flex min-h-[583px] flex-col gap-[22px]">
            <div className="flex flex-col gap-[22px]">
              {channelsLabel ? <p className="m-0 text-sm opacity-85">{channelsLabel}</p> : null}

              {channels.length ? (
                <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                  {channels.map(channel => (
                    <li key={channel.id}>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-[30px] bg-white/10 px-[22px] py-[10px] text-[13px] font-semibold tracking-[0.04em] text-white uppercase no-underline transition-colors duration-150 ease-out hover:bg-white/15"
                      >
                        <span>{channel.label || channel.platform.toUpperCase()}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap gap-7 border-t border-white pt-3">
                {phone ? (
                  <div>
                    <p className="m-0 mb-1 text-xs opacity-70">Phone</p>
                    <a href={`tel:${phone}`} className="text-base font-medium text-white no-underline">
                      {phone}
                    </a>
                  </div>
                ) : null}
                {email ? (
                  <div>
                    <p className="m-0 mb-1 text-xs opacity-70">Email</p>
                    <a href={`mailto:${email}`} className="text-base font-medium text-white no-underline">
                      {email}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>

            {footnote ? <p className="mt-auto mb-0 text-xs opacity-60">{footnote}</p> : null}
          </div>

          <div className="flex w-full flex-col rounded-[10px] bg-white p-6 text-[var(--black-100)] md:h-[583px]">
            {qrText ? <p className="m-0 text-center text-[13px] font-bold uppercase">{qrText}</p> : null}
            {qrUrl ? (
              <div className="flex flex-1 items-center justify-center">
                <img src={getStrapiMedia(qrUrl)} alt="QR" className="h-[280px] w-[280px] object-contain" />
              </div>
            ) : null}
            {qrButtonText ? (
              <a
                href={donateHref}
                className="mt-auto inline-flex w-full justify-center self-center rounded-[10px] bg-[var(--yellow-100,#f5cf3e)] px-[18px] py-3 font-semibold text-[var(--black-100)] no-underline transition-opacity duration-150 ease-out hover:opacity-90 md:w-1/2"
              >
                {qrButtonText}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
