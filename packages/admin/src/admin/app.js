import uk from '../translations/uk.json'

const config = {
  locales: [
    'en',
    'uk'
  ],
  translations: { uk },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
