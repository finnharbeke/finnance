FROM continuumio/miniconda3:latest as conda
WORKDIR /app

EXPOSE 5050

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install conda env requirements
COPY environment.yml .
RUN apt-get update && conda update --all
RUN apt-get install gcc libmariadb3 libmariadb-dev -y
RUN conda env create -p /env --file environment.yml && conda clean -afy

COPY wsgi.py /app
COPY config.py /app
COPY secret.py /app
COPY finnance /app/finnance
COPY README.md /app

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["/env/bin/gunicorn", "--preload", "-w", "4", "--bind", "0.0.0.0:5050", "wsgi:app"]
