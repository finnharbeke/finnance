import sqlite3

def initialize():

    conn = sqlite3.connect('../finnance.db')
    db = conn.cursor()

    db.executescript("""
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS accounts;
        DROP TABLE IF EXISTS entities;
        DROP TABLE IF EXISTS currencies;
    """)

    db.execute("""
        CREATE TABLE currencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(3)
        )
    """)

    db.execute("""
        CREATE TABLE accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            init_saldo DECIMAL NOT NULL,
            currency_id INTEGER NOT NULL REFERENCES currencies,
            name VARCHAR(64) NOT NULL,
            creation_date DATE
        )
    """)

    db.execute("""
        CREATE TABLE entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(64) UNIQUE
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

    insert_currencies(db)
    insert_accounts(db)
    conn.commit()

def insert_currencies(db):

    db.execute("INSERT INTO currencies (code) VALUES ('CHF')")
    db.execute("INSERT INTO currencies (code) VALUES ('EUR')")
    db.execute("INSERT INTO currencies (code) VALUES ('JPY')")
    db.execute("INSERT INTO currencies (code) VALUES ('USD')")


def insert_accounts(db):

    db.execute("INSERT INTO accounts (creation_date, name, init_saldo, currency_id) VALUES ('2019-08-05', 'Jugendprivatkonto STU-Card CH73 0070 0110 0057 9727 8', 696.55, 1)")
    db.execute("INSERT INTO accounts (creation_date, name, init_saldo, currency_id) VALUES ('2019-08-05', 'Bargeld Schweizer Franken', 1950.75, 1)")
    db.execute("INSERT INTO accounts (creation_date, name, init_saldo, currency_id) VALUES ('2019-08-05', 'ZKB PrePaid Mastercard 5267 5070 1232 9737', 12.8, 1)")
    db.execute("INSERT INTO accounts (creation_date, name, init_saldo, currency_id) VALUES ('2019-10-15', 'Jugendsparkonto CH72 0070 0352 1816 1776 7', 12.8, 1)")
    db.execute("INSERT INTO accounts (creation_date, name, init_saldo, currency_id) VALUES ('2019-08-05', 'Jugendsparkonto STU-Card CH90 0070 0350 0459 0131 9', 0, 1)")
    db.execute("INSERT INTO accounts (creation_date, name, init_saldo, currency_id) VALUES ('2019-08-05', 'Bargeld Euro', 7.69, 2)")



if __name__ == "__main__":
    initialize()