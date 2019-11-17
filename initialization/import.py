import csv
import sqlite3

def read():

    with open('transactions.csv', 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        header = next(reader)
        for row in reader:
            row = {key: val for key, val in zip(header, row)}
            del row['Betrag CHF']
            if row['Gegenüber'] == "Past" or row['Gegenüber'] == "Family":
                continue
            row['Währung'], row['Betrag'] = row['Betrag'].split()
            yield row

def insert(db, trans: dict, ggü_2_entity: dict):
    if not ggü_2_entity.get(trans['Gegenüber']):
        print(f"TRANS: {', '.join([key+': '+val for key, val in trans.items()])}")
        name = input("Name of this new Entity: ")
        if not name:
            name = trans['Gegenüber']
        if name not in ggü_2_entity.values():
            db.execute("INSERT INTO entities (name) VALUES (?)", (name,))

        ggü_2_entity[trans['Gegenüber']] = name

    ent_id = db.execute(f"SELECT id FROM entities WHERE name=\"{ggü_2_entity[trans['Gegenüber']]}\"").fetchone()[0]

    db.execute("INSERT INTO transactions (account_id, amount, counterpart_id, datetime) VALUES (1, ?, ?, ?)", 
        [trans['Betrag'], ent_id, f"2019-{trans['Datum'][3:5]}-{trans['Datum'][:2]} {trans['Uhrzeit']}:00"])

    return ggü_2_entity



if __name__ == "__main__":
    conn = sqlite3.connect('../finnance.db')
    db = conn.cursor()
    ggü_2_entity = {}
    for transaction in read():
        ggü_2_entity = insert(db, transaction, ggü_2_entity)
        conn.commit()

