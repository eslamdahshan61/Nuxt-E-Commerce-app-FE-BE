# E-Commerce Application

Full-stack e-commerce platform built with Nuxt 3, MySQL, Prisma, Redis, and Vuetify 3.

---

## 📦 Project Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### Install Dependencies
```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="24h"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

**Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://root:pass@localhost:3306/ecommerce` |
| `JWT_SECRET` | JWT signing key | Any secure random string |
| `JWT_EXPIRATION` | Token expiration time | `24h`, `7d`, `30d` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## 💾 Database Setup

### 1. Create Database
```bash
mysql -u root -p -e "CREATE DATABASE ecommerce;"
```

### 2. Run Migrations
```bash
npm run prisma:push
```

### 3. Seed Database
```bash
npm run prisma:seed
```

This creates sample data including admin user, categories, and products.

---

## 🚀 Start Application

### Development
```bash
npm run dev
```

Application runs at: **http://localhost:3000**

### Production
```bash
npm run build
npm run start
```

---

## 📚 API Documentation

Interactive API documentation: **http://localhost:3000/api-docs.html**

---

## 🔑 Admin Credentials

```
Username: admin
Password: admin
Email: admin@example.com
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin"}'
```
