type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

type PluralizedText = Partial<Record<PluralCategory, string>> & {
  other: string;
};

type DonateTranslations = {
  amountPlaceholder: string;
  amountValidationError: string;
  cancelBack: string;
  cancelConfirmBody: string;
  cancelConfirmPoints: string[];
  cancelConfirmPrompt: string;
  cancelConfirmTitle: string;
  cancelEmailDescription: string;
  cancelEmailLabel: string;
  cancelEmailPlaceholder: string;
  cancelEmailTitle: string;
  cancelErrorGeneric: string;
  cancelErrorInvalidEmail: string;
  cancelErrorNoSubscription: string;
  cancelKeepSubscription: string;
  cancelLoading: string;
  cancelModalCloseLabel: string;
  cancelStartNewSubscription: string;
  cancelSubscription: string;
  cancelSuccessBody: string;
  cancelSuccessTitle: string;
  cancelYes: string;
  cancelContinue: string;
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
  successModalBody: string[];
  successModalCloseLabel: string;
  successModalDone: string;
  successModalTitle: string;
  title: string;
};

const TRANSLATIONS: Record<string, DonateTranslations> = {
  uk: {
    amountPlaceholder: 'Введіть суму',
    amountValidationError: 'Вкажіть суму внеску',
    cancelBack: 'Назад',
    cancelConfirmBody: 'Після підтвердження регулярні списання буде припинено.',
    cancelConfirmPoints: [
      'нові платежі більше не списуватимуться;',
      'раніше здійснені благодійні внески залишаться у фонді;',
      'за потреби ви зможете відновити підписку будь-коли.',
    ],
    cancelConfirmPrompt: 'Що це означає:',
    cancelConfirmTitle: 'Ви дійсно хочете скасувати регулярну підписку?',
    cancelContinue: 'Продовжити',
    cancelEmailDescription:
      'Введіть електронну адресу, яку ви використовували під час оформлення підписки. Ми знайдемо вашу активну підписку та допоможемо її скасувати.',
    cancelEmailLabel: 'Електронна адреса*',
    cancelEmailPlaceholder: 'Example@example.com',
    cancelEmailTitle: 'Підтвердження електронної адреси',
    cancelErrorGeneric: 'Не вдалося скасувати підписку. Спробуйте ще раз пізніше.',
    cancelErrorInvalidEmail: 'Введіть коректну електронну адресу.',
    cancelErrorNoSubscription: 'Активної підписки для цієї електронної адреси не знайдено.',
    cancelKeepSubscription: 'Залишити підписку',
    cancelLoading: 'Скасовуємо...',
    cancelModalCloseLabel: 'Закрити скасування підписки',
    cancelStartNewSubscription: 'Оформити нову підписку',
    cancelSubscription: 'Скасувати підписку',
    cancelSuccessBody:
      'Дякуємо, що підтримували фонд. Ваша допомога була дуже важливою. Якщо захочете повернутися — ми будемо раді.',
    cancelSuccessTitle: 'Підписку скасовано!',
    cancelYes: 'Так, скасувати',
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
    successModalBody: [
      'Кожен внесок має значення.',
      'Саме завдяки таким людям, як ви, ми можемо змінювати життя на краще.',
      'Дякуємо, що стали частиною цієї доброї справи.',
    ],
    successModalCloseLabel: 'Закрити повідомлення',
    successModalDone: 'Готово',
    successModalTitle: 'Дякуємо за вашу підтримку!',
    title: 'Підтримати нас',
  },
  en: {
    amountPlaceholder: 'Enter amount',
    amountValidationError: 'Enter a donation amount',
    cancelBack: 'Back',
    cancelConfirmBody: 'Once confirmed, recurring charges will stop.',
    cancelConfirmPoints: [
      'no new payments will be charged;',
      'your previous charitable contributions will remain with the Foundation;',
      'you can start a new subscription at any time.',
    ],
    cancelConfirmPrompt: 'This means:',
    cancelConfirmTitle: 'Do you really want to cancel your recurring subscription?',
    cancelContinue: 'Continue',
    cancelEmailDescription:
      'Enter the email address you used when starting the subscription. We will find your active subscription and help you cancel it.',
    cancelEmailLabel: 'Email address*',
    cancelEmailPlaceholder: 'Example@example.com',
    cancelEmailTitle: 'Confirm your email address',
    cancelErrorGeneric: 'We could not cancel your subscription. Please try again later.',
    cancelErrorInvalidEmail: 'Enter a valid email address.',
    cancelErrorNoSubscription: 'No active subscription was found for this email address.',
    cancelKeepSubscription: 'Keep subscription',
    cancelLoading: 'Cancelling...',
    cancelModalCloseLabel: 'Close subscription cancellation',
    cancelStartNewSubscription: 'Start a new subscription',
    cancelSubscription: 'Cancel subscription',
    cancelSuccessBody:
      'Thank you for supporting the Foundation. Your help has meant a great deal. If you decide to return, we will be glad to welcome you back.',
    cancelSuccessTitle: 'Subscription cancelled!',
    cancelYes: 'Yes, cancel',
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
    successModalBody: [
      'Every contribution matters.',
      'Thanks to people like you, we can change lives for the better.',
      'Thank you for becoming part of this good cause.',
    ],
    successModalCloseLabel: 'Close message',
    successModalDone: 'Done',
    successModalTitle: 'Thank you for your support!',
    title: 'Support us',
  },
};

export const getDonateTranslations = (locale: string): DonateTranslations =>
  TRANSLATIONS[locale] || TRANSLATIONS.uk;
