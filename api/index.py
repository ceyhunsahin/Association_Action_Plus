"""
Vercel serverless function wrapper for FastAPI
"""
import sys
import os

# Backend klasörünü Python path'ine ekle
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Working directory'yi backend'e ayarla (database ve uploads için)
os.chdir(backend_path)

from mangum import Mangum
from main import app

# Mangum handler oluştur
handler = Mangum(app, lifespan="off")

