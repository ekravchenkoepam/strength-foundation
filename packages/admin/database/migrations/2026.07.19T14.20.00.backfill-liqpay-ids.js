'use strict';

const parsePayload = payload => {
  if (!payload) return {};
  if (typeof payload === 'object') return payload;

  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
};

const backfillTable = async (knex, tableName, onlySubscriptions) => {
  if (!(await knex.schema.hasTable(tableName))) return;
  if (!(await knex.schema.hasColumn(tableName, 'liqpay_id'))) return;

  const rows = await knex(tableName).select('id', 'action', 'payload').whereNull('liqpay_id');

  for (const row of rows) {
    const payload = parsePayload(row.payload);
    const action = String(payload.action || row.action || '');

    if (onlySubscriptions && action !== 'subscribe') continue;

    const liqpayId = payload.payment_id || payload.transaction_id;
    if (!liqpayId) continue;

    await knex(tableName)
      .where({ id: row.id })
      .update({ liqpay_id: String(liqpayId) });
  }
};

module.exports = {
  async up(knex) {
    await backfillTable(knex, 'subscriptions', true);
    await backfillTable(knex, 'payment_transactions', false);
  },

  async down() {},
};
