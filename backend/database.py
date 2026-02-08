import sqlite3
import os
from sqlite3 import Connection, Cursor
from datetime import datetime
from passlib.context import CryptContext
from sqlite3 import Error

# Şifre hash'leme ve doğrulama için CryptContext örneği
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Veritabanı dosyasının yolu
DATA_DIR = os.getenv("DATA_DIR", os.path.dirname(__file__))
DATABASE_PATH = os.path.join(DATA_DIR, "database.db")

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
        date TEXT,
        location TEXT,
        image TEXT,
        images TEXT,
        videos TEXT,
        max_participants INTEGER,
        participant_count INTEGER DEFAULT 0,
        created_by INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
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

    # Ziyaretçi sayacı (benzersiz IP)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS visitors (
        ip TEXT PRIMARY KEY,
        first_seen TEXT DEFAULT CURRENT_TIMESTAMP
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
    
    # Eğer updated_at sütunu yoksa ekle
    try:
        cursor.execute('ALTER TABLE events ADD COLUMN updated_at TEXT')
        conn.commit()
    except:
        # Sütun zaten var, devam et
        pass

    # Eğer images sütunu yoksa ekle
    try:
        cursor.execute('ALTER TABLE events ADD COLUMN images TEXT')
        conn.commit()
    except:
        pass

    # Eğer participant_count sütunu yoksa ekle
    try:
        cursor.execute('ALTER TABLE events ADD COLUMN participant_count INTEGER DEFAULT 0')
        conn.commit()
    except:
        pass

    # Eğer videos sütunu yoksa ekle
    try:
        cursor.execute('ALTER TABLE events ADD COLUMN videos TEXT')
        conn.commit()
    except:
        pass

    # Eğer visitors tablosu eskiyse yeniden oluştur
    try:
        cursor.execute('SELECT ip FROM visitors LIMIT 1')
    except:
        cursor.execute('DROP TABLE IF EXISTS visitors')
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS visitors (
            ip TEXT PRIMARY KEY,
            first_seen TEXT DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()
    
    # Üyelikler tablosunu oluştur
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS memberships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        membership_type TEXT NOT NULL DEFAULT 'standard',
        start_date TEXT DEFAULT CURRENT_TIMESTAMP,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        renewal_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Contact mesajları tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'unread'
    )
    ''')

    # Etkinlik katılımcıları tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS event_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id),
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Bağışlar tablosu
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'EUR',
        payment_method TEXT NOT NULL,
        donor_name TEXT NOT NULL,
        donor_email TEXT NOT NULL,
        donor_address TEXT,
        donor_phone TEXT,
        donor_message TEXT,
        is_recurring INTEGER DEFAULT 0,
        receipt_needed INTEGER DEFAULT 1,
        status TEXT DEFAULT 'PENDING',
        user_id INTEGER,
        transaction_id TEXT,
        transaction_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Eğer donations tablosunda eksik kolonlar varsa ekle
    for column_sql in [
        "ALTER TABLE donations ADD COLUMN transaction_date TEXT",
        "ALTER TABLE donations ADD COLUMN transaction_id TEXT",
        "ALTER TABLE donations ADD COLUMN status TEXT DEFAULT 'PENDING'",
        "ALTER TABLE donations ADD COLUMN receipt_needed INTEGER DEFAULT 1",
        "ALTER TABLE donations ADD COLUMN is_recurring INTEGER DEFAULT 0",
        "ALTER TABLE donations ADD COLUMN donor_message TEXT",
        "ALTER TABLE donations ADD COLUMN donor_phone TEXT",
        "ALTER TABLE donations ADD COLUMN donor_address TEXT",
        "ALTER TABLE donations ADD COLUMN currency TEXT DEFAULT 'EUR'",
        "ALTER TABLE donations ADD COLUMN payment_method TEXT"
    ]:
        try:
            cursor.execute(column_sql)
            conn.commit()
        except:
            pass
    
    # Üyelik ödemeleri tablosunu oluştur
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS membership_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        membership_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_type TEXT NOT NULL DEFAULT 'renewal',
        plan_type TEXT NOT NULL,
        duration_months INTEGER NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'completed',
        payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (membership_id) REFERENCES memberships (id)
    )
    ''')
    
    # Değişiklikleri kaydet
    conn.commit()
    conn.close()
    
    print("Veritabanı başlatma tamamlandı.")

def get_db_connection():
    """SQLite veritabanı bağlantısı oluştur"""
    import time
    
    conn = None
    retries = 5
    for i in range(retries):
        try:
            conn = sqlite3.connect(DATABASE_PATH, timeout=60.0)
            conn.row_factory = sqlite3.Row  # Sonuçları dict olarak al
            # WAL modunu etkinleştir
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.execute("PRAGMA cache_size=10000")
            conn.execute("PRAGMA busy_timeout=30000")
            conn.execute("PRAGMA temp_store=MEMORY")
            return conn
        except Error as e:
            print(f"Veritabanı bağlantı hatası (deneme {i+1}/{retries}): {e}")
            if conn:
                conn.close()
            time.sleep(1 * (i + 1))
    print(f"Tüm {retries} denemeden sonra veritabanı bağlantısı kurulamadı.")
    return None

# Üyelik fonksiyonları
def get_user_membership(user_id):
    """Kullanıcının aktif üyeliğini getir"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM memberships 
            WHERE user_id = ? AND status = 'active' 
            ORDER BY end_date DESC 
            LIMIT 1
        ''', (user_id,))
        
        membership = cursor.fetchone()
        
        if membership:
            return dict(zip([col[0] for col in cursor.description], membership))
        return None
    
    except Exception as e:
        print(f"Üyelik getirme hatası: {e}")
        return None
    finally:
        if conn:
            conn.close()

def create_membership(user_id, membership_type='standard', duration_days=365):
    """Yeni üyelik oluştur"""
    from datetime import datetime, timedelta
    
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        cursor.execute('''
            INSERT INTO memberships (user_id, membership_type, start_date, end_date, status)
            VALUES (?, ?, ?, ?, 'active')
        ''', (user_id, membership_type, start_date.isoformat(), end_date.isoformat()))
        
        membership_id = cursor.lastrowid
        conn.commit()
        
        return get_user_membership(user_id)
    
    except Exception as e:
        print(f"Üyelik oluşturma hatası: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()

def renew_membership(user_id, plan_type='standard', duration_months=12, amount=25.0):
    """Kullanıcının üyeliğini yenile"""
    from datetime import datetime, timedelta
    
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        
        # Mevcut üyeliği getir
        cursor.execute('''
            SELECT * FROM memberships 
            WHERE user_id = ? AND status = 'active' 
            ORDER BY end_date DESC 
            LIMIT 1
        ''', (user_id,))
        
        current_membership = cursor.fetchone()
        
        if current_membership:
            # Mevcut üyeliği pasif yap
            cursor.execute('''
                UPDATE memberships 
                SET status = 'expired', updated_at = ?
                WHERE id = ?
            ''', (datetime.now().isoformat(), current_membership[0]))
            
            # Yeni üyelik oluştur
            start_date = datetime.now()
            end_date = start_date + timedelta(days=duration_months * 30)  # Ay bazında hesapla
            renewal_count = current_membership[6] + 1  # renewal_count
            
            cursor.execute('''
                INSERT INTO memberships (user_id, membership_type, start_date, end_date, status, renewal_count)
                VALUES (?, ?, ?, ?, 'active', ?)
            ''', (user_id, plan_type, start_date.isoformat(), end_date.isoformat(), renewal_count))
            
        else:
            # İlk üyelik oluştur
            start_date = datetime.now()
            end_date = start_date + timedelta(days=duration_months * 30)
            
            cursor.execute('''
                INSERT INTO memberships (user_id, membership_type, start_date, end_date, status, renewal_count)
                VALUES (?, ?, ?, ?, 'active', 0)
            ''', (user_id, plan_type, start_date.isoformat(), end_date.isoformat()))
        
        membership_id = cursor.lastrowid
        
        # Ödeme kaydını geçici olarak atla
        payment_id = None
        print("Ödeme kaydı geçici olarak atlandı")
        
        conn.commit()
        
        return get_user_membership(user_id)
    
    except Exception as e:
        print(f"Üyelik yenileme hatası: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()

def get_membership_history(user_id):
    """Kullanıcının üyelik geçmişini getir"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM memberships 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,))
        
        memberships = cursor.fetchall()
        
        if memberships:
            return [dict(zip([col[0] for col in cursor.description], membership)) for membership in memberships]
        return []
    
    except Exception as e:
        print(f"Üyelik geçmişi getirme hatası: {e}")
        return []
    finally:
        if conn:
            conn.close()

def create_membership_payment(user_id, membership_id, amount, plan_type, duration_months):
    """Üyelik ödemesi kaydı oluştur"""
    import time
    import threading
    
    # Thread-safe lock kullan
    lock = threading.Lock()
    
    with lock:
        # Birkaç kez deneme yap
        for attempt in range(5):
            conn = get_db_connection()
            if not conn:
                print(f"Veritabanı bağlantısı kurulamadı (deneme {attempt + 1})")
                time.sleep(1)
                continue
            
            try:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO membership_payments (user_id, membership_id, amount, payment_type, plan_type, duration_months, payment_status)
                    VALUES (?, ?, ?, ?, ?, ?, 'completed')
                ''', (user_id, membership_id, amount, 'renewal', plan_type, duration_months))
                
                payment_id = cursor.lastrowid
                conn.commit()
                
                print(f"Ödeme kaydı başarıyla oluşturuldu: {payment_id}")
                return payment_id
            
            except Exception as e:
                print(f"Ödeme kaydı oluşturma hatası (deneme {attempt + 1}): {e}")
                if conn:
                    conn.rollback()
                
                if attempt < 4:  # Son deneme değilse bekle
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                else:
                    print("Maksimum deneme sayısına ulaşıldı")
                    return None
            finally:
                if conn:
                    conn.close()
        
        return None

def get_user_payment_history(user_id):
    """Kullanıcının ödeme geçmişini getir"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT mp.*, m.membership_type, m.start_date, m.end_date
            FROM membership_payments mp
            JOIN memberships m ON mp.membership_id = m.id
            WHERE mp.user_id = ?
            ORDER BY mp.payment_date DESC
        ''', (user_id,))
        
        payments = cursor.fetchall()
        
        if payments:
            return [dict(zip([col[0] for col in cursor.description], payment)) for payment in payments]
        return []
    
    except Exception as e:
        print(f"Ödeme geçmişi getirme hatası: {e}")
        return []
    finally:
        if conn:
            conn.close()

def get_all_users_with_membership():
    """Tüm kullanıcıları üyelik bilgileriyle birlikte getir"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT u.id, u.email, u.firstName, u.lastName, u.username, u.role, u.created_at,
                   m.id as membership_id, m.membership_type, m.start_date, m.end_date, 
                   m.status as membership_status, m.renewal_count,
                   (SELECT mp.id FROM membership_payments mp WHERE mp.user_id = u.id ORDER BY mp.payment_date DESC LIMIT 1) as last_payment_id
            FROM users u
            LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'active'
            ORDER BY u.created_at DESC
        ''')
        
        users = cursor.fetchall()
        print(f"Veritabanından {len(users)} kullanıcı getirildi")
        
        if users:
            result = []
            for user in users:
                user_dict = dict(zip([col[0] for col in cursor.description], user))
                
                # Üyelik bilgilerini düzenle
                if user_dict.get('membership_id') and user_dict.get('membership_id') is not None:
                    user_dict['membership'] = {
                        'id': user_dict['membership_id'],
                        'membership_type': user_dict['membership_type'],
                        'start_date': user_dict['start_date'],
                        'end_date': user_dict['end_date'],
                        'status': user_dict['membership_status'],
                        'renewal_count': user_dict['renewal_count']
                    }
                else:
                    user_dict['membership'] = None
                
                # Gereksiz alanları temizle
                keys_to_remove = ['membership_id', 'membership_type', 'start_date', 'end_date', 'membership_status', 'renewal_count']
                for key in keys_to_remove:
                    if key in user_dict:
                        del user_dict[key]
                
                result.append(user_dict)
            
            print(f"İşlenmiş {len(result)} kullanıcı döndürülüyor")
            return result
        return []
    
    except Exception as e:
        print(f"Kullanıcı listesi getirme hatası: {e}")
        return []
    finally:
        if conn:
            conn.close()

def get_user_by_id(user_id):
    """ID'ye göre kullanıcı getir"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if user:
            return dict(zip([col[0] for col in cursor.description], user))
        return None
    
    except Exception as e:
        print(f"Kullanıcı getirme hatası: {e}")
        return None
    finally:
        if conn:
            conn.close()

def get_payment_by_id(payment_id):
    """ID'ye göre ödeme getir"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT mp.*, m.membership_type, m.start_date, m.end_date
            FROM membership_payments mp
            JOIN memberships m ON mp.membership_id = m.id
            WHERE mp.id = ?
        ''', (payment_id,))
        
        payment = cursor.fetchone()
        
        if payment:
            return dict(zip([col[0] for col in cursor.description], payment))
        return None
    
    except Exception as e:
        print(f"Ödeme getirme hatası: {e}")
        return None
    finally:
        if conn:
            conn.close()

def create_donation(donation_data):
    """Bağış kaydı oluştur"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO donations (
                amount, currency, payment_method, donor_name, donor_email,
                donor_address, donor_phone, donor_message, is_recurring,
                receipt_needed, status, user_id, transaction_id, transaction_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            donation_data.get('amount'),
            donation_data.get('currency', 'EUR'),
            donation_data.get('payment_method'),
            donation_data.get('donor_name'),
            donation_data.get('donor_email'),
            donation_data.get('donor_address'),
            donation_data.get('donor_phone'),
            donation_data.get('donor_message'),
            1 if donation_data.get('is_recurring') else 0,
            1 if donation_data.get('receipt_needed', True) else 0,
            donation_data.get('status', 'PENDING'),
            donation_data.get('user_id'),
            donation_data.get('transaction_id'),
            donation_data.get('transaction_date')
        ))
        donation_id = cursor.lastrowid
        conn.commit()
        cursor.execute('SELECT * FROM donations WHERE id = ?', (donation_id,))
        donation = cursor.fetchone()
        if donation:
            return dict(zip([col[0] for col in cursor.description], donation))
        return None
    except Exception as e:
        print(f"Bağış oluşturma hatası: {e}")
        return None
    finally:
        if conn:
            conn.close()

def get_donation_by_id(donation_id):
    """ID'ye göre bağış getir"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM donations WHERE id = ?', (donation_id,))
        donation = cursor.fetchone()
        if donation:
            return dict(zip([col[0] for col in cursor.description], donation))
        return None
    except Exception as e:
        print(f"Bağış getirme hatası: {e}")
        return None
    finally:
        if conn:
            conn.close()

def get_all_donations():
    """Tüm bağışları getir"""
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM donations ORDER BY created_at DESC')
        donations = cursor.fetchall()
        return [dict(zip([col[0] for col in cursor.description], d)) for d in donations]
    except Exception as e:
        print(f"Bağış listesi getirme hatası: {e}")
        return []
    finally:
        if conn:
            conn.close()

def get_donations_by_user(user_id):
    """Kullanıcının bağışlarını getir"""
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        donations = cursor.fetchall()
        return [dict(zip([col[0] for col in cursor.description], d)) for d in donations]
    except Exception as e:
        print(f"Kullanıcı bağışları getirme hatası: {e}")
        return []
    finally:
        if conn:
            conn.close()

def update_donation_status(donation_id, status):
    """Bağış durumunu güncelle"""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE donations SET status = ? WHERE id = ?",
            (status, donation_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Bağış güncelleme hatası: {e}")
        return False
    finally:
        if conn:
            conn.close()


def track_visit(ip_address: str) -> int:
    """Benzersiz IP sayısını arttır ve toplamı döndür"""
    if not ip_address:
        return 0

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO visitors (ip) VALUES (?)", (ip_address,))
        conn.commit()
        cursor.execute("SELECT COUNT(*) FROM visitors")
        total = cursor.fetchone()[0]
        return total
    finally:
        conn.close()


def get_site_stats():
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as cnt FROM events WHERE status = 'active'")
        events_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM events WHERE status = 'active' AND date >= date('now')")
        upcoming_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM events WHERE status = 'active' AND date < date('now')")
        past_count = cursor.fetchone()["cnt"]

        # Aktif üye sayısı: admin hariç tüm kullanıcılar
        cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role != 'admin'")
        members_active = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM visitors")
        visitors_count = cursor.fetchone()["cnt"]

        return {
            "events": events_count,
            "events_upcoming": upcoming_count,
            "events_past": past_count,
            "members": members_active,
            "visitors": visitors_count
        }
    finally:
        conn.close()

# Uygulama başladığında veritabanını başlat
if __name__ == "__main__":
    init_db()
