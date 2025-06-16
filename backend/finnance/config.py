import os
from flask.helpers import get_debug_flag
import datetime as dt

# Define the application directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))  

# Define the database - we are working with
if get_debug_flag():
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
else:
    MARIADB_ROOT_PASSWORD=os.environ["MARIADB_ROOT_PASSWORD"]
    MARIADB_DATABASE=os.environ["MARIADB_DATABASE"]
    SQLALCHEMY_ENGINE_OPTIONS = {'pool_pre_ping': True, 'pool_recycle': 300}
    SQLALCHEMY_DATABASE_URI = (f'mariadb+mariadbconnector://'
        f'root:{MARIADB_ROOT_PASSWORD}@'
        f'{os.environ["DB_HOST"]}:3306/{MARIADB_DATABASE}')

DATABASE_CONNECT_OPTIONS = {}

SQLALCHEMY_TRACK_MODIFICATIONS = False

# Application threads. A common general assumption is
# using 2 per available processor cores - to handle
# incoming requests using one and performing background
# operations using the other.
THREADS_PER_PAGE = 2

if not get_debug_flag():
    # Enable protection agains *Cross-site Request Forgery (CSRF)*
    CSRF_ENABLED     = True
    # Use a secure, unique and absolutely secret key for
        # signing the data.

    CSRF_SESSION_KEY = os.environ['CSRF_SESSION_KEY']
    # Secret key for signing cookies
    SECRET_KEY = os.environ['SECRET_COOKIE_KEY']
else:
    SECRET_KEY = 'debug_secret_crazy_secure'

# FLASK-LOGIN

REMEMBER_COOKIE_DURATION = dt.timedelta(days=28)