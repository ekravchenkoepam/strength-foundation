import clsx from 'clsx';

import { Button, ButtonTypeEnum } from '@/app/components/shared';
import { PageProps } from '../../../types';

import styles from './PartnerPage.module.scss';

export const PartnerPage = (_: PageProps) => {
  return (
    <div className={styles.page}>
      <section className={styles.introSection}>
        <div className={styles.container}>
          <h1 className={clsx('h1', styles.title)}>Як стати партнером</h1>

          <div className={styles.heroMedia} />

          <p className={styles.description}>
            Ми активно розширюємо нашу команду і запрошуємо людей з великим серцем долучитися до
            важливої місії - підтримки родин військовополонених та звільнених героїв. Якщо ти мрієш
            робити щось справді значуще, працювати з командою однодумців і змінювати світ на краще -
            ми чекаємо саме на тебе!
          </p>
        </div>
      </section>

      <section className={styles.requestSection}>
        <div className={styles.container}>
          <h2 className={clsx('h2', styles.requestTitle)}>Запит на партнерство</h2>

          <div className={styles.requestGrid}>
            <div className={styles.contactsBlock}>
              <div className={clsx('h9', styles.label)}>Альтернативні канали зв&apos;язку</div>

              <div className={styles.channels}>
                <button className={styles.channelButton} type="button">TELEGRAM</button>
                <button className={styles.channelButton} type="button">VIBER</button>
                <button className={styles.channelButton} type="button">WHATSAPP</button>
              </div>

              <div className={styles.divider} />

              <div className={styles.contactRow}>
                <div>
                  <div className={clsx('h9', styles.contactLabel)}>Phone</div>
                  <a className={styles.contactValue} href="tel:+380661234567">+380 66 123 45 67</a>
                </div>

                <div>
                  <div className={clsx('h9', styles.contactLabel)}>Email</div>
                  <a className={styles.contactValue} href="mailto:example@gmail.com">example@gmail.com</a>
                </div>
              </div>

              <p className={styles.disclaimer}>
                Ми дотримуємося принципів конфіденційності та професійної етики. Уся інформація
                використовується виключно для надання консультаційних послуг.
              </p>
            </div>

            <form className={styles.formCard} onSubmit={(event) => event.preventDefault()}>
              <h3 className={styles.formTitle}>
                ЗАЛИШТЕ СВІЙ ЗАПИТ - І НАШ СПЕЦІАЛІСТ ЗВ&apos;ЯЖЕТЬСЯ З ВАМИ НАЙБЛИЖЧИМ ЧАСОМ.
              </h3>

              <div className={styles.formRow}>
                <input type="text" placeholder="Ім'я" />
                <input type="tel" placeholder="Номер телефону" />
                <input type="email" placeholder="Електронна адреса" />
              </div>

              <input type="text" placeholder="Посада/Організація" />
              <textarea placeholder="Короткий опис запиту" rows={4} />

              <label className={styles.checkboxRow}>
                <input type="checkbox" />
                <span>Даю згоду на обробку і використання персональних даних згідно з законодавством України</span>
              </label>

              <Button label="Надіслати запит" type={ButtonTypeEnum.Secondary} className={styles.submitButton} />
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
