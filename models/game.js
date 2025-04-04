'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      Game.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Game.init(
    {
      appid: DataTypes.INTEGER,
      name: DataTypes.STRING,
      playtime_2weeks: DataTypes.INTEGER,
      playtime_forever: DataTypes.INTEGER,
      last_played: DataTypes.DATE,
      img_icon_url: DataTypes.STRING,
      img_logo_url: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: 'Games',
      modelName: 'Game',
    }
  );
  return Game;
};
