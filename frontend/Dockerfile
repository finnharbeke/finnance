FROM node:latest as build
WORKDIR /build

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
RUN yarn

COPY public/ public
COPY src/ src
RUN yarn build

FROM nginx:alpine

# COPY --from=build /build/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build /build/build/ .
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/sites-available/default
RUN addgroup -S -g 33 www-data \
 && adduser -S -D -u 33 -s /sbin/nologin -h /var/www -G www-data www-data
RUN chown -R www-data:www-data /var/www/
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]