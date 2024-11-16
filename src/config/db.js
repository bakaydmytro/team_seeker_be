require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');
const winston = require('winston');

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

async function createDatabase() {
    const connection = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPassword });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
}

// Main function for connecting and synchronizing
(async () => {
    try {
        // Create the database
        await createDatabase();
        logger.info(`Database ${dbName} created or already exists.`);

        // Connect to the database with Sequelize
        const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            dialect: 'mysql',
        });

        // Define the Role model
        const Role = sequelize.define('Role', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            tableName: 'role',
            timestamps: false,
        });

        // Define the User model
        const User = sequelize.define('User', {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            birthday: {
                type: DataTypes.DATE,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            tableName: 'user',
            timestamps: false,
        });

        // Set up relationship: User belongs to Role
        User.belongsTo(Role, { foreignKey: 'role_id' });

        // Synchronize models with the database
        await sequelize.sync({ alter: true });
        logger.info('All models were synchronized successfully.');

        // Automatically create roles: admin and user
        const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } });
        const [userRole] = await Role.findOrCreate({ where: { name: 'user' } });

        // Add users with associated roles
        await User.findOrCreate({
            where: { email: 'admin@example.com' },
            defaults: {
                username: 'admin',
                birthday: new Date('1990-01-01'),
                password: 'admin',
                role_id: adminRole.id,
            }
        });

        await User.findOrCreate({
            where: {email: 'user@example.com'},
            defaults:{
                username: 'user',
                email: 'user@example.com',
                birthday: new Date('1995-01-01'),
                password: 'user',
                role_id: userRole.id,
            }
        });

        logger.info('Admin and user roles created and users added successfully.');

    } catch (error) {
        logger.error('Error during database creation or synchronization:', error);
    }
    
})();


