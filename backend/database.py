import sqlite3
import os
from passlib.context import CryptContext

# Şifre hash'leme ve doğrulama için CryptContext örneği
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    try:
        # Veritabanı dosyasının konumunu düzeltelim
        db_path = 'database.db'
        if not os.path.exists(db_path):
            # Bir üst dizine çıkalım
            db_path = os.path.join('..', 'database.db')
        
        print(f"Connecting to database at: {os.path.abspath(db_path)}")
        
        if not os.path.exists(db_path):
            print(f"Database file not found at: {os.path.abspath(db_path)}")
            # Veritabanı dosyası yoksa oluşturalım
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            create_tables(conn)
            return conn
        
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise e

def initialize_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Tabloları temizle
    cursor.execute("DROP TABLE IF EXISTS event_participants")
    cursor.execute("DROP TABLE IF EXISTS events")
    
    # Users tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profileImage TEXT,
        role TEXT DEFAULT 'user'
    )
    ''')
    
    # Events tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT,
        image TEXT,
        max_participants INTEGER DEFAULT 50,
        participant_count INTEGER DEFAULT 0,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users (id)
    )
    ''')
    
    # Event participants tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS event_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        registration_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(event_id, user_id)
    )
    ''')
    
    # Örnek etkinlikler ekleyelim
    cursor.execute('''
    INSERT OR IGNORE INTO events (id, title, date, description, image)
    VALUES 
        (1, 'Concert de musique traditionnelle', '2023-10-15', 'Un concert de musique traditionnelle avec des artistes locaux.', 'https://picsum.photos/800/400'),
        (2, 'Exposition d''art', '2023-11-01', 'Une exposition d''art contemporain.', 'https://picsum.photos/800/400?random=1'),
        (3, 'Atelier de peinture', '2023-12-10', 'Un atelier de peinture pour débutants.', 'https://picsum.photos/800/400?random=2'),
        (4, 'Soirée littéraire', '2024-01-20', 'Une soirée dédiée à la littérature avec lectures de poèmes et discussions.', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329'),
        (5, 'Festival de danse folklorique', '2025-07-15', 'Un festival coloré célébrant les danses traditionnelles.', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3'),
        (6, 'Conférence culturelle', '2025-03-05', 'Une conférence sur l''histoire et l''évolution de notre patrimoine culturel.', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'),
        (7, 'Atelier de cuisine traditionnelle', '2024-04-12', 'Apprenez à préparer des plats traditionnels avec nos chefs.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'),
        (8, 'Projection de film documentaire', '2025-05-20', 'Projection d''un documentaire sur les traditions et l''héritage culturel.', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4')
        
    ''')
    
    conn.commit()
    conn.close()

def create_tables(conn):
    cursor = conn.cursor()
    
    # Users tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profileImage TEXT,
        role TEXT DEFAULT 'user'
    )
    ''')
    
    # Events tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT,
        image TEXT,
        max_participants INTEGER DEFAULT 50,
        participant_count INTEGER DEFAULT 0,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users (id)
    )
    ''')
    
    # Event participants tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS event_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        registration_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(event_id, user_id)
    )
    ''')
    
    conn.commit()
    print("Database tables created successfully")

#   if __name__ == "__main__":
#    initialize_db()
#    print("Database initialized successfully")