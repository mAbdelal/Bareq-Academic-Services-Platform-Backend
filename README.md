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

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Search (Public)

- `GET /api/v1/search/all` - Comprehensive search across users, services, and requests
- `GET /api/v1/search/job-titles` - Search job titles
- `GET /api/v1/search/skills` - Search skills
- `GET /api/v1/academic-users/public/search` - Search academic users with filters

### Custom Requests

- `GET /api/v1/requests` - List custom requests
- `POST /api/v1/requests` - Create custom request
- `GET /api/v1/requests/:id` - Get request details
- `PUT /api/v1/requests/:id` - Update request
- `DELETE /api/v1/requests/:id` - Delete request

### Offers

- `POST /api/v1/requests/:id/offers` - Submit offer
- `GET /api/v1/requests/:id/offers` - List offers for request
- `PUT /api/v1/requests/:id/offers/:offerId` - Update offer
- `DELETE /api/v1/requests/:id/offers` - Delete offer

### Deliverables

- `POST /api/v1/deliverables` - Submit deliverable
- `PUT /api/v1/deliverables/:id/accept` - Accept deliverable
- `PUT /api/v1/deliverables/:id/reject` - Reject deliverable

### Transactions

- `GET /api/v1/transactions` - List user transactions
- `POST /api/v1/transactions/deposit` - Deposit funds
- `POST /api/v1/transactions/withdraw` - Withdraw funds

## 🔍 Search Functionality

The platform provides comprehensive search capabilities for public users:

### Academic Users Search

Search for academic users based on:

- **Job Titles**: Search by specific job titles or partial matches
- **Skills**: Filter by specific skills (comma-separated)
- **Rating Range**: Filter by minimum and maximum ratings
- **University**: Search by university name
- **Major**: Search by field of study
- **Academic Status**: Filter by academic level

**Endpoint**: `GET /api/v1/academic-users/public/search`

**Query Parameters**:

- `job_title` - Job title to search for
- `skills` - Comma-separated list of skills
- `min_rating` - Minimum rating filter
- `max_rating` - Maximum rating filter
- `university` - University name
- `major` - Field of study
- `academic_status` - Academic level
- `page` - Page number for pagination
- `limit` - Number of results per page

### Comprehensive Search

Search across all entities (users, services, requests) with a single endpoint:

**Endpoint**: `GET /api/v1/search/all`

**Query Parameters**:

- `query` - General search term
- `type` - Search type: 'users', 'services', 'requests', or 'all'
- `job_title` - Job title filter for users
- `skills` - Skills filter for users
- `min_rating` / `max_rating` - Rating range filter
- `university` / `major` - Academic filters
- `category_id` / `subcategory_id` - Category filters for services/requests
- `min_price` / `max_price` - Price range filters
- `page` / `limit` - Pagination parameters

### Job Titles & Skills Search

- `GET /api/v1/search/job-titles` - Search job titles with usage count sorting
- `GET /api/v1/search/skills` - Search skills with usage count sorting

### Usage Examples

**Search for academic users with specific skills and rating:**

```bash
GET /api/v1/academic-users/public/search?skills=JavaScript,Python&min_rating=4.0&job_title=developer
```

**Comprehensive search for services in a specific category:**

```bash
GET /api/v1/search/all?type=services&query=research&category_id=1&min_price=50&max_price=500
```

**Search for job titles containing "research":**

```bash
GET /api/v1/search/job-titles?query=research
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting middleware
- CORS protection
- Input validation with Joi
- SQL injection prevention with Prisma
