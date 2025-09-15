FROM node:22-bullseye

COPY package*.json ./
RUN npm install
RUN npm install pm2 -g

COPY . .

WORKDIR /

CMD [ "pm2-runtime", "index.js" ]