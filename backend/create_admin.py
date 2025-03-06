import sqlite3
from passlib.context import CryptContext
import os

# Şifre hash'leme için kullanılacak context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    # Veritabanı bağlantısı
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Admin kullanıcısı için bilgiler
    admin_username = "admin"
    admin_password = "admin"  # Basit bir şifre, gerçek uygulamada daha güçlü bir şifre kullanın
    admin_email = "admin@admin"
    admin_first_name = "Admin"
    admin_last_name = "User"
    
    # Şifreyi hash'le
    hashed_password = pwd_context.hash(admin_password)
    
    try:
        # Kullanıcının zaten var olup olmadığını kontrol et
        cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (admin_username, admin_email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"Admin kullanıcısı zaten var: {admin_username}")
            return
        
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
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_user() 