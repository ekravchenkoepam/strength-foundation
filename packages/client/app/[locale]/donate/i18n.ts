type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

type PluralizedText = Partial<Record<PluralCategory, string>> & {
  other: string;
};

type DonateTranslations = {
  amountPlaceholder: string;
  amountValidationError: string;
  currencyLabel: string;
  donateBreadcrumb: string;
  donationAmountLabel: string;
  emailLabel: string;
  emailValidationError: string;
  fundsDescription: string;
  fundsTitle: string;
  homeBreadcrumb: string;
  intro: string;
  liqpayTitle: string;
  oneTime: string;
  periodicity: string;
  prepareCheckoutError: string;
  quickAmountLabel: string;
  recurringBenefitDescription: string;
  recurringBenefitTitle: string;
  secureTransaction: string;
  startCheckoutError: string;
  submit: string;
  submitLoading: string;
  subscription: string;
  subscriptionAmountLabel: string;
  subscriptionTermsDescription: string;
  subscriptionTermsTitle: string;
  supporterAriaLabel: string;
  supporterNoun: PluralizedText;
  supporterPrefix: PluralizedText;
  successMessage: string;
  title: string;
};

const TRANSLATIONS: Record<string, DonateTranslations> = {
  uk: {
    amountPlaceholder: 'Введіть суму',
    amountValidationError: 'Вкажіть суму внеску',
    currencyLabel: 'Валюта платежу',
    donateBreadcrumb: 'Підтримати нас',
    donationAmountLabel: 'Сума вашого внеску*',
    emailLabel: 'Електронна адреса*',
    emailValidationError: 'Для оформлення підписки вкажіть email',
    fundsDescription:
      'Усі кошти, спрямовані на підтримку Фонду, будуть витрачені на забезпечення його діяльності та реалізацію благодійних програм.',
    fundsTitle: 'Куди підуть ваші гроші?',
    homeBreadcrumb: 'Головна',
    intro: 'Обирайте зручний спосіб, щоб підтримати нас',
    liqpayTitle: 'Підтримка через LiqPay',
    oneTime: 'Разово',
    periodicity: 'Періодичність',
    prepareCheckoutError: 'Не вдалося підготувати оплату',
    quickAmountLabel: 'Швидкий вибір суми',
    recurringBenefitDescription:
      'Регулярні внески дають фонду можливість швидко реагувати на нагальні потреби та планувати допомогу.',
    recurringBenefitTitle: 'Чому регулярні внески краще для фонду?',
    secureTransaction: 'Безпечна транзакція',
    startCheckoutError: 'Не вдалося розпочати оплату',
    submit: 'Підтримати нас',
    submitLoading: 'Створюємо оплату...',
    subscription: 'Підписка',
    subscriptionAmountLabel: 'Сума підписки*',
    subscriptionTermsDescription:
      'Підтверджуючи свою підписку ви дозволяєте фонду “Сила для Сильних” стягувати з вашої картки цей та інші платежі відповідно до їхніх умов. Щоб відписатися від підписки використовуйте відповідний функціонал у мейлі який вам буде відправлено.',
    subscriptionTermsTitle: 'Умови та політика підписки на фонд “Сила для сильних”',
    supporterAriaLabel: '{prefix} {count} {noun}',
    supporterNoun: {
      one: 'благодійник',
      few: 'благодійники',
      many: 'благодійників',
      other: 'благодійника',
    },
    supporterPrefix: {
      one: 'Нас вже підтримує',
      other: 'Нас вже підтримують',
    },
    successMessage: 'Дякуємо! Повернення з LiqPay отримано.',
    title: 'Підтримати нас',
  },
  en: {
    amountPlaceholder: 'Enter amount',
    amountValidationError: 'Enter a donation amount',
    currencyLabel: 'Payment currency',
    donateBreadcrumb: 'Support us',
    donationAmountLabel: 'Your donation amount*',
    emailLabel: 'Email address*',
    emailValidationError: 'Enter your email to start a subscription',
    fundsDescription:
      'All funds donated to support the Foundation will be used to sustain its operations and implement charitable programs.',
    fundsTitle: 'Where will your money go?',
    homeBreadcrumb: 'Home',
    intro: 'Choose a convenient way to support us',
    liqpayTitle: 'Support via LiqPay',
    oneTime: 'One-time',
    periodicity: 'Frequency',
    prepareCheckoutError: 'Unable to prepare the payment',
    quickAmountLabel: 'Quick amount selection',
    recurringBenefitDescription:
      'Regular donations help the Foundation respond quickly to urgent needs and plan its assistance.',
    recurringBenefitTitle: 'Why are regular donations better for the Foundation?',
    secureTransaction: 'Secure transaction',
    startCheckoutError: 'Unable to start the payment',
    submit: 'Support us',
    submitLoading: 'Preparing payment...',
    subscription: 'Subscription',
    subscriptionAmountLabel: 'Subscription amount*',
    subscriptionTermsDescription:
      'By confirming your subscription, you authorize the “Strength for the Strong” Foundation to charge this and future payments to your card in accordance with the applicable terms. To cancel your subscription, use the cancellation option in the email you receive.',
    subscriptionTermsTitle: 'Subscription terms and policy for the “Strength for the Strong” Foundation',
    supporterAriaLabel: '{prefix} {count} {noun}',
    supporterNoun: {
      one: 'donor',
      other: 'donors',
    },
    supporterPrefix: {
      other: 'Already supported by',
    },
    successMessage: 'Thank you! We received your LiqPay response.',
    title: 'Support us',
  },
};

export const getDonateTranslations = (locale: string): DonateTranslations =>
  TRANSLATIONS[locale] || TRANSLATIONS.uk;
