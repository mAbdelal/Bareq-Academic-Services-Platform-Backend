# Bareq - Academic Services Marketplace Backend

An academic educational platform for the university community. It serves as a marketplace where students, graduates, and academics can offer and request educational services. The platform includes a robust backend to handle all core functionalities, user management, and dispute resolution.

## 🚀 Features

- **User Management**: Academic user registration, authentication, and profile management
- **Custom Requests**: Students can post custom academic service requests
- **Offers & Bidding**: Service providers can submit offers for requests
- **File Management**: Support for file uploads and attachments
- **Payment System**: Integrated wallet system with transaction tracking
- **Dispute Resolution**: Built-in dispute handling and resolution
- **Rating System**: User rating and review system
- **Real-time Communication**: WebSocket support for chat functionality
- **Admin Panel**: Comprehensive admin dashboard for platform management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Validation**: Joi schema validation
- **Real-time**: Socket.io
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Docker & Docker Compose (optional)

## 🚀 Installation

### Option 1: Docker (Recommended)

1. Clone the repository:

```bash
git clone https://github.com/mAbdelal/Bareq-Academic-Services-Platform-Backend.git
cd bareq
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/bareq
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PLATFORM_COMMISSION_RATE=0.1
DISPUTE_PENALTY_RATE=0.05
```

4. Start the application:

```bash
docker-compose up -d
```

### Option 2: Local Development

1. Clone the repository:

```bash
git clone https://github.com/mAbdelal/Bareq-Academic-Services-Platform-Backend.git
cd bareq
```

2. Install dependencies:

```bash
npm install
```

3. Set up PostgreSQL database and update `.env` file

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Seed the database (optional):

```bash
npm run seed
```

6. Start the development server:

```bash
npm run dev
```


## 📁 Project Structure

```
bareq/
├── prisma/                 # Database schema and migrations
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic services
│   ├── socket/            # WebSocket handlers
│   ├── utils/             # Utility functions
│   └── app.js            # Express app configuration
├── uploads/               # File upload directory
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Docker image definition
└── package.json          # Dependencies and scripts
```

## 🔐 Environment Variables

| Variable                   | Description                    | Default       |
| -------------------------- | ------------------------------ | ------------- |
| `NODE_ENV`                 | Application environment        | `development` |
| `PORT`                     | Server port                    | `3000`        |
| `DATABASE_URL`             | PostgreSQL connection string   | -             |
| `JWT_ACCESS_SECRET`        | JWT access token secret        | -             |
| `JWT_REFRESH_SECRET`       | JWT refresh token secret       | -             |
| `PLATFORM_COMMISSION_RATE` | Platform commission percentage | `0.1`         |
| `DISPUTE_PENALTY_RATE`     | Dispute penalty percentage     | `0.05`        |


## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting middleware
- CORS protection
- Input validation with Joi
- SQL injection prevention with Prisma

