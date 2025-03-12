FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g sequelize-cli && npm install

COPY . .

EXPOSE 8080

CMD sh -c "npx sequelize-cli db:migrate && node server.js"