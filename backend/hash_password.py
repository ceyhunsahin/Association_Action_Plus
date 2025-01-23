import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_existing_passwords():
    conn = sqlite3.connect('/Users/ceyhun/kultur-dernek-sitesi/backend/database.db')
    cursor = conn.cursor()

    # Tüm kullanıcıları al
    cursor.execute('SELECT id, password FROM users')
    users = cursor.fetchall()

    for user in users:
        user_id, plain_password = user
        if not plain_password.startswith("$2b$"):  # Eğer şifre hash'lenmemişse
            hashed_password = pwd_context.hash(plain_password)
            cursor.execute('''
            UPDATE users SET password = ? WHERE id = ?
            ''', (hashed_password, user_id))
            conn.commit()

    conn.close()

hash_existing_passwords()