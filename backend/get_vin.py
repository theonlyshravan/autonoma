import sqlite3
try:
    conn = sqlite3.connect('autonoma.db')
    c = conn.cursor()
    c.execute("SELECT vin FROM vehicles LIMIT 1")
    row = c.fetchone()
    if row:
        print(row[0])
    else:
        print("NO_VIN")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
