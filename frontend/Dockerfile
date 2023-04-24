FROM node:20.0.0-alpine3.17 as build
WORKDIR /build

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json
RUN npm ci

COPY public/ public
COPY src/ src
RUN npm run build

CMD ["cp", "-r", "./build", "./volume"]