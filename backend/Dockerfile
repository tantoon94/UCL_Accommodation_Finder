FROM node:18

WORKDIR /app

COPY package*.json ./
COPY server.js ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]