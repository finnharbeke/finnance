# finnance

Flask React App for saving all my financial transactions etc

# dev environment

## setup

**requirements:**

- installed conda
- installed npm

```bash
conda env create -n finnance --file environment.yml
```

from `/frontend` dir:

```bash
npm i
```

## run

from base directory:

```bash
flask run --debug
```

alternatively with docker:

```bash
cd backend/
docker compose up --build
```

from `/frontend` dir:

```bash
npm run dev
```
