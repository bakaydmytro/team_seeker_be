'use strict';


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE Games
      ADD COLUMN last_played DATETIME AFTER playtime_forever;
    `);

    await queryInterface.addConstraint('Games', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_games_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Games', 'fk_games_user_id');
    await queryInterface.removeColumn('Games', 'last_played');
  },
};