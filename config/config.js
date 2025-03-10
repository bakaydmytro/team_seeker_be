require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: "mysql",
    dialectOptions: {
      socketPath: process.env.DB_HOST.startsWith("/cloudsql/")
        ? process.env.DB_HOST
        : undefined,
    },
    host: process.env.DB_HOST.startsWith("/cloudsql/")
      ? undefined
      : process.env.DB_HOST,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: "mysql",
    dialectOptions: {
      socketPath: process.env.DB_HOST.startsWith("/cloudsql/")
        ? process.env.DB_HOST
        : undefined,
    },
    host: process.env.DB_HOST.startsWith("/cloudsql/")
      ? undefined
      : process.env.DB_HOST,
  },
};
