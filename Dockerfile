FROM continuumio/miniconda3:22.11.1-alpine as conda
WORKDIR /app

EXPOSE 5050

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# musl-dev is required for stdlibs
RUN apk add --no-cache mariadb-dev gcc musl-dev
# Install conda env requirements
COPY environment.yml .
RUN conda env create -p /env --file environment.yml && conda clean -afy

COPY wsgi.py /app
COPY config.py /app
COPY secret.py /app
COPY finnance /app/finnance
COPY README.md /app

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["/env/bin/gunicorn", "--preload", "-w", "4", "--bind", "0.0.0.0:5050", "wsgi:app"]
