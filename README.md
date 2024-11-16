# team_seeker


## Setup
 - Run `npm install command`
 - Add db credentials in .env DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST
 - Run `npx sequelize db:create` to create database
 - Run `npx sequelize db:migrate` to add all tables and relations
 - Run `npx sequelize-cli db:seed:all` to add test data

Example how to create a model using npx sequelize:
`npx sequelize-cli model:generate --name Role --attributes name:string`