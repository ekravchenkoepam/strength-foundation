'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::volunteer-page.volunteer-page', {
  config: {
    find: {
      auth: false,
    },
  },
});
