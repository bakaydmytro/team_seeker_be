FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g sequelize-cli && npm install

COPY . .

EXPOSE 8080

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
