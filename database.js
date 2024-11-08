const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

// Конфігурація бази даних
const dbName = 'TeamSeeker';
const dbUser = 'admin';
const dbPassword = 'admin';
const dbHost = 'localhost';

// Функція для створення бази даних, якщо її не існує
async function createDatabase() {
    const connection = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPassword });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
}

// Головна функція для підключення та синхронізації
(async () => {
    try {
        // Створюємо базу даних
        await createDatabase();
        console.log(`Database ${dbName} created or already exists.`);

        // Підключаємося до бази даних за допомогою Sequelize
        const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            dialect: 'mysql',
        });

        // Визначення моделі Role
        const Role = sequelize.define('Role', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            tableName: 'role',
            timestamps: false,
        });

        // Визначення моделі User
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

        // Встановлюємо зв’язок: User належить до Role
        User.belongsTo(Role, { foreignKey: 'role_id' });

        // Синхронізація моделей з базою даних
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        // Автоматичне створення ролей: admin та user
        const adminRole = await Role.findOrCreate({
            where: { name: 'admin' },
        });
        const userRole = await Role.findOrCreate({
            where: { name: 'user' },
        });

    // Додавання користувачів 
    const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        birthday: new Date('1990-01-01'),
        password: 'admin',
        role_id: adminRole[0].id,  // Використовуємо id ролі admin
    });

    const regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        birthday: new Date('1995-01-01'),
        password: 'user',
        role_id: userRole[0].id,  // Використовуємо id ролі user
    });

    console.log('Admin and user roles created and users added successfully.');

} catch (error) {
    console.error('Error during database creation or synchronization:', error);
}
})();
