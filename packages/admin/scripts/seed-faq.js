'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'faq-seed.json');
const REQUIRED_LOCALES = ['uk', 'en'];
const FAQ_PAGE_UID = 'api::faq-page.faq-page';

const toSlug = value =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яіїєґ\- ]/gi, '')
    .replace(/\s+/g, '-');

const toLocalizedSlug = (baseSlug, locale) => {
  if (locale === 'uk') return baseSlug;
  const suffix = `-${locale}`;
  return baseSlug.endsWith(suffix) ? baseSlug : `${baseSlug}${suffix}`;
};

function parseSeedData() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (data?.locales) {
    for (const locale of REQUIRED_LOCALES) {
      if (!Array.isArray(data.locales?.[locale]?.categories)) {
        throw new Error(`Missing locales.${locale}.categories in faq-seed.json`);
      }
    }

    return data.locales;
  }

  if (Array.isArray(data?.categories)) {
    return { uk: { categories: data.categories } };
  }

  throw new Error('Invalid faq-seed.json format.');
}

async function upsertCategory(strapi, category, position, locale, localizationId) {
  const baseSlug = category.slug || toSlug(category.title);
  const slug = toLocalizedSlug(baseSlug, locale);
  const payload = {
    title: category.title,
    slug,
    position,
    locale,
    publishedAt: new Date().toISOString(),
  };

  const existingBySlug = await strapi.entityService.findMany('api::faq-category.faq-category', {
    locale,
    publicationState: 'preview',
    filters: { slug },
    limit: 1,
  });

  const existingByPosition = await strapi.entityService.findMany('api::faq-category.faq-category', {
    locale,
    publicationState: 'preview',
    filters: { position },
    limit: 1,
  });

  const existing = existingBySlug?.[0] ? existingBySlug : existingByPosition;

  if (existing?.[0]) {
    return strapi.entityService.update('api::faq-category.faq-category', existing[0].id, {
      data: payload,
    });
  }

  if (localizationId) {
    payload.localizations = [localizationId];
  }

  return strapi.entityService.create('api::faq-category.faq-category', { data: payload });
}

async function upsertFaq(strapi, faq, categoryId, position, locale, localizationId) {
  const payload = {
    question: faq.question,
    answer: faq.answer,
    position,
    category: categoryId,
    locale,
    publishedAt: new Date().toISOString(),
  };

  const existing = await strapi.entityService.findMany('api::faq.faq', {
    locale,
    publicationState: 'preview',
    filters: {
      category: categoryId,
      position,
    },
    limit: 1,
  });

  if (existing?.[0]) {
    return strapi.entityService.update('api::faq.faq', existing[0].id, {
      data: payload,
    });
  }

  if (localizationId) {
    payload.localizations = [localizationId];
  }

  return strapi.entityService.create('api::faq.faq', { data: payload });
}

function buildFaqPageData(localePayload, sectionFaqIds) {
  const faqPage = localePayload?.faqPage || {};
  const categories = localePayload?.categories || [];

  const faqSection = categories.map((category, index) => ({
    title: category.title,
    items: sectionFaqIds[index] || [],
  }));

  return {
    title: faqPage.title || '',
    description: faqPage.description || '',
    contactsTitle: faqPage.contactsTitle || '',
    contacts: faqPage.contacts || [],
    faqTitle: faqPage.faqTitle || '',
    faqSection,
    publishedAt: new Date().toISOString(),
  };
}

async function upsertFaqPage(strapi, locale, localePayload, sectionFaqIds, localizationId) {
  const existing = await strapi.entityService.findMany(FAQ_PAGE_UID, {
    locale,
    publicationState: 'preview',
  });

  const data = {
    locale,
    ...buildFaqPageData(localePayload, sectionFaqIds),
  };

  if (existing?.id) {
    return strapi.entityService.update(FAQ_PAGE_UID, existing.id, { data });
  }

  if (localizationId) {
    data.localizations = [localizationId];
  }

  return strapi.entityService.create(FAQ_PAGE_UID, { data });
}

async function seedFaqs(strapi) {
  const localizedData = parseSeedData();
  const ukCategories = localizedData.uk?.categories || [];
  const enCategories = localizedData.en?.categories || [];
  const ukFaqIdsBySection = [];
  const enFaqIdsBySection = [];

  if (!ukCategories.length) {
    console.log('No categories found in seed file.');
    return;
  }

  for (let cIndex = 0; cIndex < ukCategories.length; cIndex += 1) {
    const ukCategory = ukCategories[cIndex];
    const enCategory = enCategories[cIndex];
    const position = cIndex + 1;

    const ukCategoryEntity = await upsertCategory(strapi, ukCategory, position, 'uk');
    const enCategoryEntity = enCategory
      ? await upsertCategory(strapi, enCategory, position, 'en', ukCategoryEntity.id)
      : null;

    const ukFaqs = ukCategory.faqs || [];
    const enFaqs = enCategory?.faqs || [];
    const ukFaqIds = [];
    const enFaqIds = [];

    for (let fIndex = 0; fIndex < ukFaqs.length; fIndex += 1) {
      const ukFaq = ukFaqs[fIndex];
      const enFaq = enFaqs[fIndex];
      const faqPosition = fIndex + 1;

      const ukFaqEntity = await upsertFaq(strapi, ukFaq, ukCategoryEntity.id, faqPosition, 'uk');
      ukFaqIds.push(ukFaqEntity.id);

      if (enFaq && enCategoryEntity?.id) {
        const enFaqEntity = await upsertFaq(strapi, enFaq, enCategoryEntity.id, faqPosition, 'en', ukFaqEntity.id);
        enFaqIds.push(enFaqEntity.id);
      }
    }

    ukFaqIdsBySection.push(ukFaqIds);
    enFaqIdsBySection.push(enFaqIds);
  }

  const ukFaqPage = await upsertFaqPage(strapi, 'uk', localizedData.uk, ukFaqIdsBySection);
  await upsertFaqPage(strapi, 'en', localizedData.en, enFaqIdsBySection, ukFaqPage.id);

  console.log('FAQ seed complete for locales: uk, en');
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
