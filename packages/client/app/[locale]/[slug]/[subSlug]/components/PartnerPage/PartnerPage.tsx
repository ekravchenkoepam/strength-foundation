import { PartnershipForm } from './PartnershipForm';
import { PageProps } from '../../../types';

import { TelegramIcon, ViberIcon, WhatsappIcon } from '@/app/components/icons';

const contactChannelClassName = [
  'flex min-h-[56px] min-w-[190px] items-center justify-center gap-[16px]',
  'rounded-full border border-transparent bg-[var(--green-80)] px-6 py-[10px]',
  'text-[16px] font-medium leading-[var(--h10-line)]',
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

const PARTNERSHIP_SECTION_TRANSLATIONS = {
  uk: {
    title: 'Запит на партнерство',
    alternativeChannels: 'Альтернативні канали зв’язку',
    privacy:
      'Ми дотримуємося принципів конфіденційності та професійної етики. Уся інформація використовується виключно для надання консультаційних послуг.',
  },
  en: {
    title: 'Partnership request',
    alternativeChannels: 'Alternative communication channels',
    privacy:
      'We adhere to the principles of confidentiality and professional ethics. All information is used exclusively to provide consulting services.',
  },
} as const;

export const PartnerPage = ({ locale }: PageProps) => {
  const sectionTranslations = PARTNERSHIP_SECTION_TRANSLATIONS[locale === 'en' ? 'en' : 'uk'];

  return (
    <div className="w-full">
      <section className="bg-[var(--white-80)] pb-[52px] md:pb-[72px]">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h1 className="h1 pb-[30px] pt-6 text-center md:pb-12 md:pt-8">Як стати партнером</h1>

          <div className="h-[min(34vw,530px)] min-h-[260px] w-full rounded-[20px] bg-[#c4c4c4]" />

          <p className="mx-auto mt-7 max-w-[760px] text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-12">
            Ми активно розширюємо нашу команду і запрошуємо людей з великим серцем долучитися до важливої місії -
            підтримки родин військовополонених та звільнених героїв. Якщо ти мрієш робити щось справді значуще,
            працювати з командою однодумців і змінювати світ на краще - ми чекаємо саме на тебе!
          </p>
        </div>
      </section>

      <section className="border-b border-[var(--color-yellow)] bg-[var(--green-100)] pb-16 pt-16 text-[color:var(--white-100)] lg:pb-12 lg:pt-8">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h2 className="h2 mb-8 text-center md:mb-14 lg:mb-[72px]">{sectionTranslations.title}</h2>

          <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-2">
            <div className="flex h-full flex-col gap-10 lg:min-h-[770px] lg:justify-between lg:gap-0">
              <div>
                <div className="h9 mb-[28px] text-[color:var(--green-40)]">
                  {sectionTranslations.alternativeChannels}
                </div>

                <div className="flex flex-wrap gap-[10px]">
                  {CONTACT_CHANNELS.map(({ id, label, Icon }) => (
                    <button key={id} className={contactChannelClassName} type="button">
                      <span>{label}</span>
                      <Icon width="24" height="24" color="#F5F5F5" backgroundColor="transparent" />
                    </button>
                  ))}
                </div>

                <div className="my-[48px] border-b border-[var(--green-60)]" />

                <div className="flex flex-col gap-5 md:flex-row md:gap-16">
                  <div>
                    <div className="h9 mb-[6px] text-[color:var(--green-40)]">Phone</div>
                    <a className="text-[length:var(--h6-size)] leading-[var(--h6-line)]" href="tel:+380661234567">
                      +380 66 123 45 67
                    </a>
                  </div>

                  <div>
                    <div className="h9 mb-[6px] text-[color:var(--green-40)]">Email</div>
                    <a
                      className="text-[length:var(--h6-size)] leading-[var(--h6-line)]"
                      href="mailto:example@gmail.com"
                    >
                      example@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-[14px] leading-[var(--h10-line)]">{sectionTranslations.privacy}</p>
            </div>

            <PartnershipForm locale={locale} />
          </div>
        </div>
      </section>
    </div>
  );
};
