'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('users', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_users_role_id', 
      references: {
        table: 'roles',
        field: 'id',
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'fk_users_role_id');
  },
};
