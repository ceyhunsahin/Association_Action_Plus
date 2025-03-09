import sqlite3
import os
from sqlite3 import Connection, Cursor
from datetime import datetime
from passlib.context import CryptContext

# Şifre hash'leme ve doğrulama için CryptContext örneği
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Veritabanı dosyasının yolu
DATABASE_PATH = "database.db"

def dict_factory(cursor, row):
    """Satırları sözlük olarak döndüren fabrika fonksiyonu"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db() -> Connection:
    """Veritabanı bağlantısını döndürür"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory
    return conn

def init_db():
    """Veritabanını başlatır ve tabloları oluşturur"""
    print("Veritabanı başlatılıyor...")
    
    # Veritabanı dosyasının var olup olmadığını kontrol et
    db_exists = os.path.exists(DATABASE_PATH)
    
    # Veritabanı bağlantısını oluştur
    conn = get_db()
    cursor = conn.cursor()
    
    # Kullanıcılar tablosunu oluştur - Mevcut yapıyı koru
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        firstName TEXT,
        lastName TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        profileImage TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
    )
    ''')
    
    # Etkinlikler tablosunu oluştur
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        created_by INTEGER,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (created_by) REFERENCES users (id)
    )
    ''')
    
    # Haberler tablosunu oluştur
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        created_by INTEGER,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (created_by) REFERENCES users (id)
    )
    ''')
    
    # Eğer veritabanı yeni oluşturulduysa, admin kullanıcısını ekle
    if not db_exists:
        print("Yeni veritabanı oluşturuldu, admin kullanıcısı ekleniyor...")
        
        # Admin şifresini hash'le
        admin_password = pwd_context.hash("admin")
        
        # Admin kullanıcısını ekle
        cursor.execute('''
        INSERT INTO users (email, firstName, lastName, username, password, role, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', ("admin@admin", "Admin", "User", "admin", admin_password, "admin", datetime.now().isoformat(), datetime.now().isoformat()))
    
    # Değişiklikleri kaydet
    conn.commit()
    conn.close()
    
    print("Veritabanı başlatma tamamlandı.")

# Uygulama başladığında veritabanını başlat
if __name__ == "__main__":
    init_db()