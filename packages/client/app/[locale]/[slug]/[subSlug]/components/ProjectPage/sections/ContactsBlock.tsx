import { getStrapiMedia } from '@/app/utils/api-helpers';

import { ContactsBlock as ContactsBlockProps } from '../types';

export const ContactsBlock = ({
  title,
  channelsLabel,
  channels = [],
  phone,
  email,
  qrText,
  qrImage,
  qrButtonText,
  qrButtonHref,
  footnote,
}: ContactsBlockProps) => {
  const qrUrl = qrImage?.data?.attributes?.url;

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[var(--green-100)] bg-[url('/images/asphalt-bg-alt.png')] bg-cover bg-center px-[52px] py-14 text-white md:py-[72px]">
      <div className="flex flex-col gap-9">
        <h2 className="m-0 text-center text-[28px] font-bold md:text-[32px]">{title}</h2>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1.1fr_0.9fr] md:gap-9">
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

            <div className="flex flex-wrap gap-7 border-t border-white/15 pt-3">
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

            {footnote ? <p className="m-0 text-xs opacity-60">{footnote}</p> : null}
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-[var(--black-100)]">
            {qrText ? <p className="m-0 text-center text-[13px] font-bold uppercase">{qrText}</p> : null}
            {qrUrl ? <img src={getStrapiMedia(qrUrl)} alt="QR" className="h-[220px] w-[220px] object-contain" /> : null}
            {qrButtonHref && qrButtonText ? (
              <a
                href={qrButtonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-full justify-center rounded-[10px] bg-[var(--yellow-100,#f5cf3e)] px-[18px] py-3 font-semibold text-[var(--black-100)] no-underline transition-opacity duration-150 ease-out hover:opacity-90"
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
