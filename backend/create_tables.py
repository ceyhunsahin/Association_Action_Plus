import sqlite3
from database import init_db

if __name__ == "__main__":
    print("Veritabanı tabloları oluşturuluyor...")
    init_db()
    print("Tablolar başarıyla oluşturuldu!") 