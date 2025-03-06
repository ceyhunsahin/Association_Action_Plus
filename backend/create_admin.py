import sqlite3
import os
from passlib.context import CryptContext

# Şifre hash'leme için kullanılacak context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    # Veritabanı dosyasının konumunu düzeltelim
    db_path = 'database.db'
    
    # Tam yolu alalım
    abs_path = os.path.abspath(db_path)
    print(f"Veritabanı yolu: {abs_path}")
    print(f"Veritabanı var mı: {os.path.exists(abs_path)}")
    
    # Veritabanı bağlantısı
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Tabloları kontrol et
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Mevcut tablolar:", [table[0] for table in tables])
    
    # Users tablosunu oluştur (yoksa)
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
    conn.commit()
    
    # Admin kullanıcısı için bilgiler
    admin_username = "admin"
    admin_password = "admin"
    admin_email = "admin@admin"
    admin_first_name = "Admin"
    admin_last_name = "User"
    
    # Şifreyi hash'le
    hashed_password = pwd_context.hash(admin_password)
    
    try:
        # Önce mevcut admin kullanıcısını sil (varsa)
        cursor.execute("DELETE FROM users WHERE username = ? OR email = ?", (admin_username, admin_email))
        conn.commit()
        print(f"Mevcut admin kullanıcısı silindi (varsa)")
        
        # Admin kullanıcısını ekle
        cursor.execute('''
        INSERT INTO users (username, email, password, firstName, lastName, role)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (admin_username, admin_email, hashed_password, admin_first_name, admin_last_name, "admin"))
        
        conn.commit()
        print(f"Admin kullanıcısı başarıyla oluşturuldu: {admin_username}")
        print(f"Kullanıcı adı: {admin_username}")
        print(f"Şifre: {admin_password}")
        print(f"Email: {admin_email}")
        
        # Oluşturulan kullanıcıyı kontrol et
        cursor.execute("SELECT * FROM users WHERE username = ?", (admin_username,))
        admin_user = cursor.fetchone()
        if admin_user:
            print("Admin kullanıcısı veritabanında bulundu:")
            admin_dict = dict(admin_user)
            admin_dict['password'] = '********'  # Şifreyi gizle
            print(admin_dict)
        else:
            print("Admin kullanıcısı veritabanında bulunamadı!")
        
        # Tüm kullanıcıları listele
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        print(f"Veritabanında {len(users)} kullanıcı bulundu:")
        for user in users:
            user_dict = dict(user)
            user_dict['password'] = '********'  # Şifreyi gizle
            print(user_dict)
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_user() 