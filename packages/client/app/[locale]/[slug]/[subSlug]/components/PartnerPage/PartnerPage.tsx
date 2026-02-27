import { PageProps } from '../../../types';
import { TelegramIcon, ViberIcon, WhatsappIcon } from '@/app/components/icons';

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

export const PartnerPage = (_: PageProps) => {
  return (
    <div className="w-full">
      <section className="bg-[var(--white-80)] pb-[52px] md:pb-[72px]">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h1 className="h1 pb-[30px] pt-6 text-center md:pb-12 md:pt-8">Як стати партнером</h1>

          <div className="h-[min(34vw,530px)] min-h-[260px] w-full rounded-[20px] bg-[#c4c4c4]" />

          <p className="mx-auto mt-7 max-w-[760px] text-[length:var(--h8-size)] leading-[var(--h8-line)] md:mt-12">
            Ми активно розширюємо нашу команду і запрошуємо людей з великим серцем долучитися до
            важливої місії - підтримки родин військовополонених та звільнених героїв. Якщо ти мрієш
            робити щось справді значуще, працювати з командою однодумців і змінювати світ на краще -
            ми чекаємо саме на тебе!
          </p>
        </div>
      </section>

      <section className="border-b border-[var(--color-yellow)] bg-[var(--green-100)] pb-[64px] pt-[64px] text-[color:var(--white-100)] lg:pb-[104px] lg:pt-[96px]">
        <div className="mx-auto px-6 lg:px-[52px]">
          <h2 className="h2 mb-8 text-center md:mb-14">Запит на партнерство</h2>

          <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-2">
            <div className="flex h-full flex-col gap-10 lg:h-[533px] lg:justify-between lg:gap-0">
              <div>
                <div className="h9 mb-[28px] text-[color:var(--green-40)]">Альтернативні канали зв&apos;язку</div>

                <div className="flex flex-wrap gap-[10px]">
                  {CONTACT_CHANNELS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      className="flex items-center justify-center gap-[16px] rounded-full border border-transparent bg-[var(--green-80)] px-6 py-[10px] text-[16px] font-medium leading-[var(--h10-line)] min-w-[200px] min-h-[60px]"
                      type="button"
                    >
                      <span>{label}</span>
                      <Icon width="24" height="24" color="#F5F5F5" backgroundColor="transparent" />
                    </button>
                  ))}
                </div>

                <div className="my-[48px] border-b border-[var(--green-60)]" />

                <div className="flex flex-col gap-5 md:flex-row md:gap-12">
                  <div>
                    <div className="h9 mb-[6px] text-[color:var(--green-40)]">Phone</div>
                    <a className="text-[length:var(--h6-size)] leading-[var(--h6-line)]" href="tel:+380661234567">+380 66 123 45 67</a>
                  </div>

                  <div>
                    <div className="h9 mb-[6px] text-[color:var(--green-40)]">Email</div>
                    <a className="text-[length:var(--h6-size)] leading-[var(--h6-line)]" href="mailto:example@gmail.com">example@gmail.com</a>
                  </div>
                </div>
              </div>

              <p className="text-[14px] leading-[var(--h10-line)]">
                Ми дотримуємося принципів конфіденційності та професійної етики. Уся інформація
                використовується виключно для надання консультаційних послуг.
              </p>
            </div>

            <div className="h-[533px]">
              <iframe
                title="Airtable form"
                className="h-full w-full rounded-[10px] border-[7px]"
                src="https://airtable.com/embed/appHf0wEp7PWiSv01/pag9HuYfS2PTVVyeD/form"
                width="100%"
                height="533"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
