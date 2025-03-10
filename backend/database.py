import sqlite3
import os
from sqlite3 import Connection, Cursor
from datetime import datetime
from passlib.context import CryptContext
from sqlite3 import Error

# Şifre hash'leme ve doğrulama için CryptContext örneği
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Veritabanı dosyasının yolu
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def dict_factory(cursor, row):
    """Satırları sözlük olarak döndüren fabrika fonksiyonu"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db() -> Connection:
    """Veritabanı bağlantısını döndürür"""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = dict_factory
        return conn
    except Error as e:
        print(f"Veritabanı bağlantı hatası: {e}")
    
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
    
    # Bağışlar tablosunu yeniden oluştur
    cursor.execute('DROP TABLE IF EXISTS donations')
    
    # Bağışlar tablosunu oluştur
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        payment_method TEXT NOT NULL,
        transaction_id TEXT,
        status TEXT NOT NULL,
        donor_name TEXT NOT NULL,
        donor_email TEXT NOT NULL,
        donor_address TEXT,
        donor_phone TEXT,
        donor_message TEXT,
        is_recurring INTEGER DEFAULT 0,
        receipt_needed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
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

def get_db_connection():
    """SQLite veritabanı bağlantısı oluştur"""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row  # Sonuçları dict olarak al
        return conn
    except Error as e:
        print(f"Veritabanı bağlantı hatası: {e}")
    
    return conn

def create_donation(donation_data):
    """Yeni bağış oluştur"""
    conn = get_db()
    if not conn:
        print("Veritabanı bağlantısı kurulamadı")
        return None
    
    try:
        cursor = conn.cursor()
        print(f"Bağış verileri: {donation_data}")
        
        # Benzersiz transaction ID oluştur
        import random
        transaction_id = f"TRX-{int(datetime.now().timestamp())}-{random.randint(1000, 9999)}"
        
        # Kullanıcı ID'sini al (varsa)
        user_id = donation_data.get('user_id')
        
        # Sorgu
        query = '''
        INSERT INTO donations (
            amount, currency, payment_method, transaction_id, 
            donor_name, donor_email, status, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        cursor.execute(query, (
            float(donation_data['amount']),
            donation_data['currency'],
            donation_data['payment_method'],
            transaction_id,
            donation_data['donor_name'],
            donation_data['donor_email'],
            'PENDING',
            user_id,  # Kullanıcı ID'si null olabilir
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ))
        
        conn.commit()
        donation_id = cursor.lastrowid
        print(f"Bağış oluşturuldu, ID: {donation_id}")
        
        # Yanıt
        return {
            "id": donation_id,
            "amount": donation_data['amount'],
            "status": "PENDING",
            "message": "Donation created successfully",
            "user_id": user_id
        }
    
    except Exception as e:
        print(f"Bağış oluşturma hatası: {str(e)}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()

def get_user_donations(user_id):
    """Kullanıcının bağışlarını getir"""
    conn = get_db()  # dict_factory kullanarak sonuçları dict olarak al
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        query = '''
        SELECT * FROM donations 
        WHERE user_id = ? 
        ORDER BY created_at DESC
        '''
        
        cursor.execute(query, (user_id,))
        donations = cursor.fetchall()
        
        # Sonuçlar zaten dict olarak geliyor
        return donations
    
    except Exception as e:
        print(f"Kullanıcı bağışlarını getirme hatası: {str(e)}")
        return []
    finally:
        if conn:
            conn.close()

def get_donation_by_id(donation_id):
    """Bağış detaylarını getir"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        query = 'SELECT * FROM donations WHERE id = ?'
        
        cursor.execute(query, (donation_id,))
        donation = cursor.fetchone()
        
        if donation:
            return dict(donation)
        return None
    
    except Error as e:
        print(f"Bağış detaylarını getirme hatası: {e}")
        return None
    finally:
        if conn:
            conn.close()

# Uygulama başladığında veritabanını başlat
if __name__ == "__main__":
    init_db()