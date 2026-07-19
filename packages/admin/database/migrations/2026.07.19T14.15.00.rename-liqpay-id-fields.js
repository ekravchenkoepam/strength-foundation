'use strict';

const renameColumnIfNeeded = async (knex, tableName, oldColumn, newColumn) => {
  const hasTable = await knex.schema.hasTable(tableName);
  if (!hasTable) return;

  const hasOldColumn = await knex.schema.hasColumn(tableName, oldColumn);
  const hasNewColumn = await knex.schema.hasColumn(tableName, newColumn);

  if (hasOldColumn && !hasNewColumn) {
    await knex.schema.alterTable(tableName, table => {
      table.renameColumn(oldColumn, newColumn);
    });
  }
};

module.exports = {
  async up(knex) {
    await renameColumnIfNeeded(knex, 'subscriptions', 'last_payment_id', 'liqpay_id');
    await renameColumnIfNeeded(knex, 'payment_transactions', 'payment_id', 'liqpay_id');

    if (await knex.schema.hasTable('subscriptions')) {
      await knex('subscriptions').where({ source: 'checkout_init', action: 'checkout_init' }).delete();
    }
  },

  async down(knex) {
    await renameColumnIfNeeded(knex, 'subscriptions', 'liqpay_id', 'last_payment_id');
    await renameColumnIfNeeded(knex, 'payment_transactions', 'liqpay_id', 'payment_id');
  },
};
