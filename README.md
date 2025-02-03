# Student Management System - Backend API

A RESTful API built with Node.js and PostgreSQL for managing student records and marks.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (Node Package Manager)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 
- **Authentication**: API Key based
- **Other Tools**: cors, dotenv, express-rate-limit

## Project Setup

1. **Clone the repository**
  ```bash
  git clone <repository-url>
  cd student-management-system/backend

2. **Install dependencies**
    ```bash
   npm install
3. **Environment Setup Create a .env file in the root directory:**
     ```env
    PORT=5000
    DB_USER=postgres           
    DB_HOST=localhost
    DB_NAME=student_management
    DB_PASSWORD=password
    DB_PORT=5432
    API_KEY=kjshrbksdrkjshertguyerfebfysd
    JWT_SECRET=jkbfdzchjgwerfjwerbsabrfwdsfkjfsdfuhkh
    DB_POOL_MAX=20
    NODE_ENV=development
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=100
    JWT_EXPIRES_IN=1d
    LOG_LEVEL=info
    LOG_FILE=app.log

4. **Database Setup**
    ```sql
    CREATE DATABASE student_management;
 **Run migrations:**
    ```bash
    npm run migrate

5. **Start the Server**
    ```bash
    npm start

# After this basic setup you're good to go