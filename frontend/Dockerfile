FROM node:20-alpine3.17 as build
WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
RUN npm ci

COPY public/ public
COPY src/ src
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf.template
COPY ./entrypoint.sh .

ENTRYPOINT [ "sh", "./entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]