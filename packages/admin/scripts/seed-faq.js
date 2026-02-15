/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const strapiFactory = require('@strapi/strapi');

const SEED_PATH = path.join(__dirname, 'faq-seed.json');
const DEFAULT_LOCALE = 'uk';

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яіїєґ\- ]/gi, '')
    .replace(/\s+/g, '-');

async function seedFaqs(strapi) {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.categories?.length) {
    console.log('No categories found in seed file.');
    return;
  }

  for (let cIndex = 0; cIndex < data.categories.length; cIndex += 1) {
    const category = data.categories[cIndex];
    const slug = category.slug || toSlug(category.title);
    const categoryPayload = {
      title: category.title,
      slug,
      position: cIndex + 1,
      locale: DEFAULT_LOCALE,
      publishedAt: new Date().toISOString(),
    };

    const existingCategory = await strapi.entityService.findMany('api::faq-category.faq-category', {
      filters: { slug },
      limit: 1,
    });

    const categoryEntity = existingCategory?.[0]
      ? await strapi.entityService.update('api::faq-category.faq-category', existingCategory[0].id, {
          data: categoryPayload,
        })
      : await strapi.entityService.create('api::faq-category.faq-category', {
          data: categoryPayload,
        });

    const faqs = category.faqs || [];
    for (let fIndex = 0; fIndex < faqs.length; fIndex += 1) {
      const faq = faqs[fIndex];
      const faqPayload = {
        question: faq.question,
        answer: faq.answer,
        position: fIndex + 1,
        category: categoryEntity.id,
        locale: DEFAULT_LOCALE,
        publishedAt: new Date().toISOString(),
      };

      const existingFaq = await strapi.entityService.findMany('api::faq.faq', {
        filters: {
          question: faq.question,
          category: categoryEntity.id,
        },
        limit: 1,
      });

      if (existingFaq?.[0]) {
        await strapi.entityService.update('api::faq.faq', existingFaq[0].id, {
          data: faqPayload,
        });
      } else {
        await strapi.entityService.create('api::faq.faq', {
          data: faqPayload,
        });
      }
    }
  }

  console.log('FAQ seed complete.');
}

async function run() {
  const createStrapi =
    strapiFactory.createStrapi ||
    (strapiFactory.default && strapiFactory.default.createStrapi) ||
    strapiFactory.default ||
    strapiFactory;

  if (typeof createStrapi !== 'function') {
    throw new Error('Unable to resolve createStrapi from @strapi/strapi');
  }

  const strapi = await createStrapi().load();
  try {
    await seedFaqs(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
