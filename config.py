# Statement for enabling the development environment
DEBUG = False

# Define the application directory
import os
# ROOTPW, CSRF_SESSION_KEY, SECRET_KEY
from secret import *
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  

# Define the database - we are working with
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = ROOTPW
MYSQL_DB = 'finnance'
# SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
SQLALCHEMY_DATABASE_URI = f'mariadb+mariadbconnector://root:{ROOTPW}@localhost/finnance'
DATABASE_CONNECT_OPTIONS = {}

SQLALCHEMY_TRACK_MODIFICATIONS = False

# Application threads. A common general assumption is
# using 2 per available processor cores - to handle
# incoming requests using one and performing background
# operations using the other.
THREADS_PER_PAGE = 2

# Enable protection agains *Cross-site Request Forgery (CSRF)*
CSRF_ENABLED     = True
