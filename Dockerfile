FROM node:13-alpine as builder
WORKDIR /app
COPY package.json /app/package.json
RUN  npm install -g @angular/cli@9.0.3 && npm install
COPY . /app/

## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run ng build -- --prod --output-path=dist

### STAGE 2: Setup ###

FROM nginx:1.17.5-alpine

## Copy our default nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/vscan.pem /etc/nginx/ssl/vscan.pem
COPY ./nginx/vscan.key /etc/nginx/ssl/vscan.key

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
