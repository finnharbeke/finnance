FROM node:20-alpine3.17 as build
WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
RUN npm ci

COPY public/ public
COPY src/ src
RUN npm run build
RUN rm -rf node_modules

FROM nginx:stable-alpine

COPY --from=build /app/build/ /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY --from=build /app/entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "sh", "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]