from flask import Flask, render_template
import sqlite3
import datetime

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/list-transactions")
def list_transactions():
    conn = sqlite3.connect('finnance.db')
    conn.row_factory = sqlite3.Row # makes query callable as tuples AND dicts
    db = conn.cursor()
    transactions = db.execute("SELECT transactions.id, datetime, account_id, amount, name FROM transactions JOIN entities ON counterpart_id=entities.id").fetchall()
    tidied_transactions = []
    for transaction in transactions:
        trans_datetime = datetime.datetime.strptime(transaction['datetime'], '%Y-%m-%d %H:%M:%S')
        tidied = {
            "id": transaction['id'],
            "date": trans_datetime.strftime('%d.%m.%Y'),
            "time": trans_datetime.strftime('%H:%M'),
            "account_id": transaction['account_id'],
            "counterpart_name": transaction['name'],
            "amount": transaction['amount']
        }

        tidied_transactions.append(tidied)
    return render_template("transactions.html", transactions=transactions)

@app.route("/edit/<int:id>")
def edit_trans(id):
    conn = sqlite3.connect('finnance.db')
    conn.row_factory = sqlite3.Row # makes query callable as tuples AND dicts
    db = conn.cursor()
    trans = db.execute("SELECT * FROM transactions WHERE id=?", (id,)).fetchone()
    return render_template("edit.html", transaction=trans)