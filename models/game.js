'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      Game.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Game.init(
    {
      appid: DataTypes.INTEGER,
      name: DataTypes.STRING,
      playtime_2weeks: DataTypes.INTEGER,
      playtime_forever: DataTypes.INTEGER,
      img_icon_url: DataTypes.STRING,
      img_logo_url: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: 'games',
      modelName: 'Game',
    }
  );
  return Game;
};
