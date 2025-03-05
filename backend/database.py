import sqlite3
import os
from passlib.context import CryptContext

# Şifre hash'leme ve doğrulama için CryptContext örneği
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db_path = os.path.join(os.path.dirname(__file__), 'your_database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_db():
    db_path = os.path.join(os.path.dirname(__file__), 'your_database.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # users tablosunu oluştur veya güncelle
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'  -- Varsayılan değer: 'user'
    )
    ''')

    # Eğer users tablosu varsa ve role sütunu yoksa, ekle
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]  # Sütun adlarını al

    if 'role' not in column_names:
        cursor.execute('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT "user"')

    # Events tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        image TEXT
    )
    ''')

    # User_events tablosu - user_email yerine user_id kullanacak şekilde güncellendi
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE(user_id, event_id)
    )
    ''')

    # Örnek etkinlikleri ekle
    cursor.execute('''
    INSERT OR IGNORE INTO events (id, title, date, description, image)
    VALUES 
        (1, 'Concert de musique traditionnelle', '2023-10-15', 'Un concert de musique traditionnelle avec des artistes locaux.', 'https://picsum.photos/1280/720'),
        (2, 'Exposition d''art', '2023-11-01', 'Une exposition d''art contemporain.', 'https://picsum.photos/1280/720'),
        (3, 'Atelier de peinture', '2023-12-10', 'Un atelier de peinture pour débutants.', 'https://picsum.photos/1280/720')
    ''')

    # Örnek admin kullanıcılarını ekle
    admin_users = [
        {
            "firstName": "Admin",
            "lastName": "User1",
            "username": "admin1",
            "email": "admin1@admin1",
            "password": pwd_context.hash("admin"),  # Şifre hash'lendi
            "role": "admin"  # Admin rolü belirtildi
        },
        {
            "firstName": "Admin",
            "lastName": "User2",
            "username": "admin2",
            "email": "admin2@admin2",
            "password": pwd_context.hash("admin"),  # Şifre hash'lendi
            "role": "admin"  # Admin rolü belirtildi
        }
    ]

    for user in admin_users:
        cursor.execute('''
        INSERT OR IGNORE INTO users (firstName, lastName, username, email, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (user["firstName"], user["lastName"], user["username"], user["email"], user["password"], user["role"]))

    conn.commit()
    conn.close()