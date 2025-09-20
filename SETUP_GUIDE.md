

- **Git** - [Download Git](https://git-scm.com/downloads)
- **Docker** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🔧 Step-by-Step Setup

### Step 1: Clone the Repository

1. **Open your terminal/command prompt**
2. **Navigate to your desired directory** (e.g., `cd C:\Projects` or `cd ~/Projects`)
3. **Clone the repository:**
   ```bash
   git clone https://github.com/mAbdelal/Bareq-Academic-Services-Platform-Backend.git
cd bareq
   ```
4. **Navigate into the project directory:**
   ```bash
   cd bareq-backend
   ```

### Step 2: Environment Configuration

1. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

   _(If no .env.example exists, create a .env file manually)_

2. **Configure your environment variables in `.env`:**

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:password@localhost:5432/bareq_db?schema=public"

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-here"

   # Add other required environment variables as needed
   ```

### Step 3: Docker Setup

1. **Make sure Docker is running:**

   - Start Docker Desktop
   - Wait for it to fully start (green status)

2. **Build and start the containers:**

   ```bash
   docker-compose up --build
   ```

   **Alternative (run in background):**

   ```bash
   docker-compose up --build -d
   ```

3. **Wait for services to start:**
   - PostgreSQL database will start first
   - Backend application will start after database is ready
   - You should see logs indicating successful startup

### Step 4: Database Migration

1. **Run Prisma migrations:**

   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

   **Or if you want to reset the database:**

   ```bash
   docker-compose exec backend npx prisma migrate reset --force
   ```

### Step 5: Seed the Database

1. **Run the seed script:**

   ```bash
   docker-compose exec backend npm run seed
   ```

   **Alternative (if no seed script in package.json):**

   ```bash
   docker-compose exec backend node prisma/seed.js
   ```

2. **Wait for seeding to complete:**
   - You should see success messages for each seeded table
   - The process will clear existing data and seed fresh data

### Step 6: Verify Setup

1. **Check if the application is running:**

   - Open your browser and go to `http://localhost:3000`
   - You should see the API response or documentation

2. **Check database connection:**
   ```bash
   docker-compose exec backend npx prisma studio
   ```
   - This will open Prisma Studio in your browser
   - You can view all the seeded data

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Stop the containers
docker-compose down

# Change port in docker-compose.yml or .env file
# Then restart
docker-compose up --build
```

#### Issue 2: Database Connection Failed

**Error:** `Database connection failed`

**Solution:**

1. Check if PostgreSQL container is running:

   ```bash
   docker-compose ps
   ```

2. Check database logs:

   ```bash
   docker-compose logs postgres
   ```

3. Restart the database:
   ```bash
   docker-compose restart postgres
   ```

#### Issue 3: Permission Denied

**Error:** `Permission denied` on Linux/Mac

**Solution:**

```bash
# Give execute permissions
chmod +x scripts/*.sh

# Or run with sudo (not recommended)
sudo docker-compose up --build
```

#### Issue 4: Seed Script Fails

**Error:** `Error during seeding`

**Solution:**

1. Check if database is ready:

   ```bash
   docker-compose exec postgres psql -U postgres -d bareq_db -c "SELECT 1;"
   ```

2. Reset and reseed:
   ```bash
   docker-compose exec backend npx prisma migrate reset --force
   docker-compose exec backend npm run seed
   ```

## 📁 Project Structure

After successful setup, your project structure should look like:

```
bareq-backend/
├── prisma/
│   ├── migrations/
│   ├── seed/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── ...
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env
```

## 🚀 Development Commands

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend bash

# Restart specific service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Database Commands

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# View database in Prisma Studio
docker-compose exec backend npx prisma studio

# Reset database and reseed
docker-compose exec backend npx prisma migrate reset --force
```

## ✅ Verification Checklist

- [ ] Repository cloned successfully
- [ ] Docker containers are running (`docker-compose ps`)
- [ ] Database is accessible
- [ ] Migrations applied successfully
- [ ] Seed data inserted successfully
- [ ] API is responding at `http://localhost:3000`
- [ ] Prisma Studio shows seeded data

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:**

   ```bash
   docker-compose logs
   ```

2. **Verify environment variables** in `.env` file

3. **Check Docker status:**

   ```bash
   docker --version
   docker-compose --version
   ```

4. **Restart everything:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## 🎉 Success!

Once you've completed all steps, you should have:

- ✅ A running backend API
- ✅ A PostgreSQL database with seeded data
- ✅ All services running in Docker containers
- ✅ Access to Prisma Studio for database management

Your Bareq backend is now ready for development! 🚀
