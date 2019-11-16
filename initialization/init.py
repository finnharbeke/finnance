import sqlite3

def initialize():

    conn = sqlite3.connect('../finnance.db')
    db = conn.cursor()

    db.executescript("""
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS accounts;
        DROP TABLE IF EXISTS entities;
    """)

    db.execute("""
        CREATE TABLE accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            init_saldo DECIMAL NOT NULL
        )
    """)

    db.execute("""
        CREATE TABLE entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(64)
        )
    """)

    db.execute("""
        CREATE TABLE transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL REFERENCES accounts,
            amount DECIMAL NOT NULL,
            counterpart_id INTEGER NOT NULL REFERENCES entities,
            datetime DATETIME
        )
    """)

if __name__ == "__main__":
    initialize()