# finnance

Flask React App for saving all my financial transactions etc

## contribute

thank you for considering contributing to this project :) let me walk you through the setup:

### setting up the environment

**requirements:**

you should have installed `conda` and `npm`.

**backend:**

create a conda environment according to the dependencies of this projects backend like so:

```
conda env create -n finnance --file backend/environment.yml
```

**frontend:**

head into the `./frontend` directory and run the following to install the node packages used for the frontend:
```
npm i
```

*in case the project changes its dependencies the above should be repeated!*

### running locally

in one terminal window head into the `./backend` directory and do:

```
conda activate finnance
flask run --debug
```

in another, head into the `./frontend` directory:
```
npm start
```

if it doesn't open automatically you should find the application on `localhost:3000`!

### populating the local database

for development purposes it is cumbersome to start off with an empty database. you should be able to head into the `./frontend/dummy_data` directory and run:

```
npx tsx seed.ts
```

you might be prompted to install tsx and then you will find lots of data when logging in with:

- username: `local`
- password: `123456`

This data should be deterministic during the current month, so that you can compare with other contributors.