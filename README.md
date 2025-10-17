# Nuxt.js E-Commerce Application

A full-stack e-commerce application built with Nuxt.js 4, featuring a modern frontend with Vuetify, a robust API backend, MySQL database with Prisma ORM, and Redis caching.

## 🚀 Features

- **Frontend**: Nuxt.js 4 with Vue 3, Vuetify UI framework
- **Backend**: Nuxt.js API routes with TypeScript
- **Database**: MySQL with Prisma ORM
- **Caching**: Redis for session management and caching
- **Authentication**: JWT-based authentication system
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Admin Dashboard**: Complete admin interface for managing products and categories
- **Docker Support**: Full Docker containerization for development and production

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## 🛠️ Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Nuxt-E-Commerce-app-FE-BE
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_NAME=ecommerce
DB_USER=ecommerce
DB_PASSWORD=password
DB_PORT=3306

# Redis Configuration
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h

# Node Environment
NODE_ENV=development
```

**⚠️ Important**: Change the `JWT_SECRET` to a secure random string in production!

## 🐳 Running with Docker (Recommended)

### Development Mode

```bash
# Start all services in development mode
docker-compose --profile dev up --build

# Run in background
docker-compose --profile dev up --build -d
```

### Production Mode

```bash
# Start all services in production mode
docker-compose --profile prod up --build

# Run in background
docker-compose --profile prod up --build -d
```

### Stop Services

```bash
# Stop all services
docker-compose --profile dev down

# Stop and remove volumes (⚠️ This will delete all data!)
docker-compose --profile dev down -v
```

## 🗄️ Database Setup

The application automatically handles database setup including:

### Migrations
- **Location**: `prisma/migrations/`
- **Latest Migration**: `20251017000903_init` (contains all initial tables)
- **Auto-run**: Migrations run automatically on container startup

### Seeders
- **Location**: `prisma/seeders/`
- **Auto-run**: Seeders run automatically after migrations
- **Data**: Creates admin user, categories, and sample products

### Manual Database Operations

If you need to run database operations manually:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Run seeders
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```


## 🚀 Running Locally (Without Docker)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Database

You'll need to set up MySQL and Redis locally, then update the `DATABASE_URL` and `REDIS_URL` in your `.env` file.

### 3. Run Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

## 📚 API Documentation

Once the application is running, you can access:

- **API Documentation**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api/openapi.json

### Available API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get category by ID
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

#### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user

## 🔐 Admin Credentials for Testing

The application comes with a pre-seeded admin account:

- **Username**: `admin`
- **Password**: `admin`
- **Email**: `admin@example.com`

You can use these credentials to:
- Access the admin dashboard
- Test authentication endpoints
- Manage products and categories

## 📊 Sample Data

The database is automatically seeded with:

### Categories
- Electronics (with subcategories: Smartphones, Laptops)
- Clothing (with subcategories: Men's Clothing, Women's Clothing)
- Home & Kitchen

### Products (10 items)
- **Electronics**: iPhone 15 Pro, Samsung Galaxy S24 Ultra, MacBook Pro 14", Dell XPS 15
- **Clothing**: Men's Cotton T-Shirt, Men's Denim Jeans, Women's Summer Dress, Women's Yoga Pants
- **Home & Kitchen**: Coffee Maker, Blender Set

## 🏗️ Project Structure

```
├── app/                    # Nuxt.js pages and components
│   ├── pages/             # Application pages
│   │   ├── dashboard/     # Admin dashboard pages
│   │   └── api-docs.vue   # API documentation page
│   ├── middleware/        # Route middleware
│   └── plugins/           # Nuxt plugins
├── server/                # API routes and server-side code
│   ├── api/               # API endpoints
│   ├── middleware/        # Server middleware
│   ├── utils/             # Server utilities
│   └── schemas/           # Validation schemas
├── prisma/                # Database configuration
│   ├── migrations/        # Database migrations
│   ├── seeders/           # Database seeders
│   └── schema.prisma      # Database schema
├── stores/                # Pinia state management
├── composables/           # Vue composables
├── types/                 # TypeScript type definitions
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
└── README.md             # This file
```

## 🔁 Recursive Product Count (Event‑Driven)

This project uses an event‑driven cache invalidation strategy to keep each category’s "recursive product count" accurate across the category tree.

- **What it does**: When products or categories change, we invalidate the cached count for the affected category and all of its ancestors so the next read recomputes a fresh total.
- **Why**: Categories form a tree. A product added to a leaf should update counts all the way up the chain (e.g., Subcategory → Parent → Root).
- **How**:
  - Events are emitted on create/update/delete for categories and products.
  - Each event calls a recursive invalidation function that walks `parentId` pointers to the root and clears relevant Redis keys.
  - Cache key format: `category:{categoryId}:recursive-product-count`.

Key implementation: see `server/utils/events.ts` (e.g., `emitProductCreated`, `emitProductUpdated`, `emitProductDeleted`, and `invalidateCategoryAndAncestors`).

## 🔧 Development Commands

```bash
# Development
npm run dev                # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run preview           # Preview production build

# Database
npm run prisma:generate   # Generate Prisma client
npm run prisma:push       # Push schema to database
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Run seeders

# Docker
docker-compose --profile dev up --build    # Start development
docker-compose --profile prod up --build   # Start production
docker-compose --profile dev down          # Stop development
```

## 🌐 Access Points

When running with Docker:

- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Database**: localhost:3306 (MySQL)
- **Redis**: localhost:6379

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check if MySQL container is running
   docker-compose ps
   # Check MySQL logs
   docker-compose logs mysql
   ```

3. **Migration Issues**
   ```bash
   # Reset database (⚠️ This will delete all data!)
   docker-compose down -v
   docker-compose --profile dev up --build
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app-dev
docker-compose logs mysql
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f app-dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting) above
2. Review the [API documentation](http://localhost:3000/api-docs)
3. Open an issue on GitHub
4. Check the application logs for error details

---

**Happy coding! 🚀**