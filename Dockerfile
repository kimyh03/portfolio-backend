#!/bin/bash

FROM node:14.15.4
WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]