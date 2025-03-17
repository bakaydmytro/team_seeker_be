'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      Friendship.belongsTo(models.User, { foreignKey: 'requester_id', as: 'requester' });
      Friendship.belongsTo(models.User, { foreignKey: 'addressee_id', as: 'addressee' });
    }
  }
  Friendship.init(
    {
      requester_id: DataTypes.INTEGER,
      addressee_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Friendship',
      tableName: 'Friendships',
      timestamps: true,
    }
  );
  return Friendship;
};