FROM node:12.18.3-alpine AS builder
WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "run", "start:prod"]