FROM node:17

WORKDIR /app

COPY package.json .

RUN npm install

COPY . ./

ENV PORT 8000

EXPOSE $PORT

CMD ["node", "index.js"]
