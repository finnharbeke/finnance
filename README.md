# finnance

SQL / Flask App for saving all my financial transactions etc

## Links

Deployment: [tutorial](https://www.javacodemonk.com/part-2-deploy-flask-api-in-production-using-wsgi-gunicorn-with-nginx-reverse-proxy-4cbeffdb)


## dev environment

### setup

```
conda env create -n finnance --file environment.yml
```

### run


from base directory:
```
flask run --debug -p 5050
```

from `/frontend` dir:
```
npm start
```