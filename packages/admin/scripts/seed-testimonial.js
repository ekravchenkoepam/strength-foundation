'use strict';

const strapiFactory = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'testimonial-seed.json');
const DEFAULT_LOCALE = 'uk';

async function seedTestimonials(strapi) {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);

  if (!data?.testimonials?.length) {
    console.log('No testimonials found in seed file.');
    return;
  }

  for (let index = 0; index < data.testimonials.length; index += 1) {
    const testimonial = data.testimonials[index];
    const payload = {
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      position: testimonial.position ?? index + 1,
      locale: DEFAULT_LOCALE,
      publishedAt: new Date().toISOString(),
    };

    const existing = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters: { name: testimonial.name, role: testimonial.role },
      limit: 1,
    });

    if (existing?.[0]) {
      await strapi.entityService.update('api::testimonial.testimonial', existing[0].id, {
        data: payload,
      });
    } else {
      await strapi.entityService.create('api::testimonial.testimonial', {
        data: payload,
      });
    }
  }

  console.log('Testimonial seed complete.');
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
    await seedTestimonials(strapi);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

run();
