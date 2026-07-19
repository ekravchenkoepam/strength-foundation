'use strict';

const DEFAULT_LIST_LAYOUTS = {
  'api::subscription.subscription': [
    'id',
    'orderId',
    'liqpayId',
    'email',
    'amount',
    'currency',
    'isActive',
    'status',
    'periodicity',
    'createdAt',
  ],
  'api::payment-transaction.payment-transaction': [
    'id',
    'orderId',
    'liqpayId',
    'email',
    'amount',
    'currency',
    'status',
    'mode',
    'createdAt',
  ],
};

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const contentTypeService = strapi.plugin('content-manager').service('content-types');

    for (const [uid, listLayout] of Object.entries(DEFAULT_LIST_LAYOUTS)) {
      const contentType = strapi.contentType(uid);
      const configuration = await contentTypeService.findConfiguration(contentType);

      if (JSON.stringify(configuration.layouts.list) === JSON.stringify(listLayout)) {
        continue;
      }

      await contentTypeService.updateConfiguration(contentType, {
        settings: configuration.settings,
        metadatas: configuration.metadatas,
        layouts: {
          ...configuration.layouts,
          list: listLayout,
        },
      });
    }
  },
};
