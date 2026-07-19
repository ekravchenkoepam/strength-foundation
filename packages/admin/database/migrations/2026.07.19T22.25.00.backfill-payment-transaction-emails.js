'use strict';

const normalizeEmail = value => String(value || '').trim().toLowerCase();

const rememberEmail = (emailByIdentifier, column, value, email) => {
  const normalizedValue = String(value || '').trim();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedValue || !normalizedEmail) return;
  emailByIdentifier.set(`${column}:${normalizedValue}`, {
    column,
    value: normalizedValue,
    email: normalizedEmail,
  });
};

module.exports = {
  async up(knex) {
    if (!(await knex.schema.hasTable('payment_transactions'))) return;
    if (!(await knex.schema.hasColumn('payment_transactions', 'email'))) return;

    const emailByIdentifier = new Map();
    const transactionSources = await knex('payment_transactions')
      .select('order_id', 'subscribe_id', 'email')
      .whereNotNull('email');

    for (const source of transactionSources) {
      rememberEmail(emailByIdentifier, 'order_id', source.order_id, source.email);
      rememberEmail(emailByIdentifier, 'subscribe_id', source.subscribe_id, source.email);
    }

    if (await knex.schema.hasTable('subscriptions')) {
      const subscriptionSources = await knex('subscriptions')
        .select('order_id', 'subscribe_id', 'email')
        .whereNotNull('email');

      for (const source of subscriptionSources) {
        rememberEmail(emailByIdentifier, 'order_id', source.order_id, source.email);
        rememberEmail(emailByIdentifier, 'subscribe_id', source.subscribe_id, source.email);
      }
    }

    for (const { column, value, email } of emailByIdentifier.values()) {
      await knex('payment_transactions')
        .where(column, value)
        .where(query => query.whereNull('email').orWhere('email', ''))
        .update({ email });
    }
  },

  async down() {},
};
