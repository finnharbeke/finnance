FROM continuumio/miniconda3:latest as conda
WORKDIR /app

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install conda env requirements
COPY environment.yml .
RUN apt update && conda update --all
RUN apt install gcc libmariadb3 libmariadb-dev -y
RUN conda env create -p /env --file environment.yml && conda clean -afy
# conda env create -n flask-new --file environment.yml && conda clean -afy

COPY wsgi.py /app
COPY finnance /app/finnance

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["/env/bin/gunicorn", "--preload", "-w", "4", "--bind", "0.0.0.0:5050", "wsgi:app"]
