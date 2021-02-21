FROM node:14.15.5-alpine3.10
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
EXPOSE 3000