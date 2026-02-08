# Vercel Deployment Rehberi

Bu proje hem frontend (React) hem backend (FastAPI) içerir ve Vercel üzerinde deploy edilebilir.

## Kurulum Adımları

### 1. Vercel CLI Kurulumu (Opsiyonel)
```bash
npm i -g vercel
```

### 2. Vercel'e Deploy Etme

#### Yöntem 1: Vercel Dashboard Üzerinden
1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi bağlayın
4. Root directory olarak proje klasörünü seçin
5. Build settings:
   - **Framework Preset:** Other
   - **Root Directory:** (boş bırakın veya `/` olarak ayarlayın)
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/build`
6. Environment Variables ekleyin (Vercel dashboard'dan):
   - `REACT_APP_API_BASE_URL`: Vercel deployment URL'iniz (örn: `https://your-project.vercel.app`)
   - Backend için gerekli tüm `.env` değişkenlerini ekleyin:
     - `EMAIL_HOST`
     - `EMAIL_PORT`
     - `EMAIL_USER`
     - `EMAIL_PASSWORD`
     - `SECRET_KEY` (JWT için)
     - `ALGORITHM` (JWT için)
7. "Deploy" butonuna tıklayın

#### Yöntem 2: Vercel CLI ile
```bash
# Proje root dizininde
vercel

# Production'a deploy etmek için
vercel --prod
```

### 3. Environment Variables Ayarlama

Vercel Dashboard'dan veya CLI ile environment variables ekleyin:

```bash
# CLI ile
vercel env add REACT_APP_API_BASE_URL
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add SECRET_KEY
vercel env add ALGORITHM
```

**Önemli:** `REACT_APP_API_BASE_URL` değişkenini Vercel deployment URL'iniz olarak ayarlayın. Örneğin:
- Development: `https://your-project.vercel.app`
- Production: `https://your-project.vercel.app`

### 4. Database Notları

- SQLite database dosyası (`database.db`) Vercel'in serverless ortamında kalıcı değildir
- Production için bir veritabanı servisi kullanmanız önerilir:
  - **PostgreSQL:** Vercel Postgres, Supabase, Neon
  - **MySQL:** PlanetScale, Railway
  - **MongoDB:** MongoDB Atlas

### 5. Dosya Yükleme Notları

- `uploads/` ve `factures/` klasörleri Vercel'in serverless ortamında kalıcı değildir
- Dosya yükleme için bir storage servisi kullanmanız önerilir:
  - **Vercel Blob Storage**
  - **AWS S3**
  - **Cloudinary**
  - **Supabase Storage**

### 6. Build ve Deploy

Vercel otomatik olarak:
1. Frontend'i build eder (`frontend/build`)
2. Backend API'yi serverless function olarak deploy eder (`api/index.py`)

### 7. URL Yapısı

- Frontend: `https://your-project.vercel.app/`
- Backend API: `https://your-project.vercel.app/api/*`

## Sorun Giderme

### Backend çalışmıyor
- `api/index.py` dosyasının doğru yolda olduğundan emin olun
- `mangum` paketinin `requirements.txt`'de olduğunu kontrol edin
- Vercel function logs'ları kontrol edin

### Frontend API'ye bağlanamıyor
- `REACT_APP_API_BASE_URL` environment variable'ının doğru ayarlandığından emin olun
- CORS ayarlarını kontrol edin
- Browser console'da hata mesajlarını kontrol edin

### Database hatası
- SQLite yerine kalıcı bir veritabanı kullanın
- Connection string'i environment variable olarak ekleyin

## Önemli Notlar

1. **Serverless Functions:** Vercel'de backend serverless function olarak çalışır, bu yüzden:
   - Her request yeni bir instance başlatabilir
   - Cold start süreleri olabilir
   - Database connection pooling önemlidir

2. **File System:** Vercel'in file system'i read-only'dir (bazı geçici yazma alanları hariç)
   - Dosya yükleme için external storage kullanın

3. **Environment Variables:** Tüm `.env` değişkenlerini Vercel dashboard'dan ekleyin

4. **Build Timeout:** Vercel'in build timeout'u 45 dakikadır, büyük projeler için yeterli olmalıdır

