# Sales Management API

<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  <br>
  <h3>A modern sales management REST API built with NestJS, TypeORM and PostgreSQL</h3>
</div>

## 🚀 Overview

This project is a robust REST API for sales management, developed using NestJS framework and PostgreSQL. It provides a complete solution for managing products, users, sales records, and generating reports. The API follows modern development practices including typed interfaces, repository pattern, dependency injection, and comprehensive documentation.

## ✨ Features

- **Authentication & Authorization**: JWT-based auth system with secure password hashing
- **User Management**: Create, update, and manage user accounts with proper role access
- **Product Management**: Full CRUD operations for product catalog
- **Sales Records**: Track and manage all sales with filtering capabilities
- **Reporting System**: Generate sales reports in different formats (JSON, PDF)
- **API Documentation**: Fully documented API with Swagger UI
- **Database Integration**: TypeORM with PostgreSQL for reliable data persistence
- **Containerization**: Docker and Docker Compose for easy deployment

## 🛠️ Technology Stack

- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Authentication**: JWT with Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Password Hashing**: bcrypt
- **Environment Configuration**: dotenv

## 📋 API Endpoints

The API provides the following main endpoints:

- **Auth**: `/auth/register`, `/auth/login`
- **Users**: `/users` (CRUD operations)
- **Products**: `/products` (CRUD operations)
- **Sales**: `/sales` (Create, Read, Filter, Update, Delete)
- **Reports**: `/reports/generate` (Generate sales reports)

Full API documentation is available at `/api` endpoint when the server is running.

## 🏗️ Architecture

The project follows a modular architecture with the following components:

- **Controllers**: Handle HTTP requests and define API endpoints
- **Services**: Implement business logic
- **Repositories**: Handle database operations
- **DTOs**: Define data transfer objects for validation and type safety
- **Entities**: Define database models
- **Guards**: Protect routes with authentication
- **Modules**: Organize related components

## 🚦 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for development)

### Running with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/MatiasToroLecaros/sales-app.git
   cd sales-app
   ```

2. Start the Docker containers:
   ```bash
   docker-compose up
   ```

3. The API will be available at http://localhost:3000
   - API documentation: http://localhost:3000/api

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=myuser
   DB_PASSWORD=mypassword
   DB_NAME=mydb
   JWT_SECRET=yoursecretkey
   ```

3. Run in development mode:
   ```bash
   npm run start:dev
   ```

## 🧪 Testing the API

After starting the server, you can test the API using the Swagger UI at http://localhost:3000/api.

### Basic Flow:

1. Register a user: `POST /auth/register`
2. Login to get an auth token: `POST /auth/login`
3. Use the token to authenticate other requests
4. Create products: `POST /products`
5. Create sales: `POST /sales`
6. Generate reports: `POST /reports/generate`

## 📁 Project Structure

```
src/
├── auth/                # Authentication module
├── products/            # Products module
├── sales/               # Sales module
├── users/               # Users module
├── reports/             # Reports module
├── app.module.ts        # Main application module
├── main.ts              # Application entry point
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Route protection with Guards
- Input validation with class-validator
- Data sanitization

## 🔄 CI/CD

The project includes configuration for continuous integration and deployment:

- Docker configuration for containerized deployments
- Environment variables for different deployment scenarios

## 📈 Future Improvements

- Add unit and integration tests
- Implement caching for improved performance
- Add role-based access control
- Enhance reporting capabilities with charts and visualizations
- Implement WebSocket for real-time updates

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For any inquiries, please reach out to [mtorolecaros@gmail.com](mailto:mtorolecaros@gmail.com)