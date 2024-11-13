// models/todoModel.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/db'); // Assuming this is where you configure and export the Sequelize instance
const User = require('./config/db'); // Import User model

// Define Todo model
const Todo = sequelize.define('Todo', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'todos',
  timestamps: true,
});

// Set up relationship: Todo belongs to User
Todo.belongsTo(User, { foreignKey: 'userId' });

module.exports = Todo;





