FROM node:13-alpine as builder
WORKDIR /app
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
COPY . /app/
