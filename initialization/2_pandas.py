import pandas as pd
import datetime as dt
import sqlite3

def csv_2_df(filename) -> pd.DataFrame:
    df = pd.read_csv(filename, header=0, sep=',', quotechar='"', index_col='id')
    
    # filter out initial saldos
    df = df[df['Kommentar'] != 'INIT']

    # drop Betrag CHF
    df = df.drop(columns=['Betrag CHF'])
    # split up Betrag & Currency
    df['Currency'] = df['Betrag'].map(lambda x: x[:3])
    df['Betrag'] = df['Betrag'].map(lambda x: x.split()[-1])

    # datetime
    df['datetime'] = (df['Datum'] + ' ' + df['Uhrzeit']).map(lambda x: dt.datetime.strptime(x, '%d.%m.%y %H:%M'))
    df = df.drop(columns=['Datum', 'Uhrzeit'])
    
    # print(df)
    return df

if __name__ == "__main__":
    con = sqlite3.connect('../finnance.db')
    csv_2_df('transactions.csv').to_sql('transactions', con=con, if_exists="replace", index_label='id',)