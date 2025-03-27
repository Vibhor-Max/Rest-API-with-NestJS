# Project Name

This project is a A secure RESTful API built with TypeScript, NestJS, Node.js, and PostgreSQL for managing fitness exercises with user engagement features.

Key Features:

🔐 Authentication

1. JWT-based user registration/login

2. Secure token refresh mechanism

🏋️ Exercise Management

1. Create/update/delete exercises with name, description, difficulty (1-5), and visibility

2. Public exercises (modifiable by all) vs private (creator-only)

3. Advanced filtering/sorting by name, difficulty, etc.

❤️ User Engagement

1. Favorite/save exercises with tracking

2. Rate exercises (1-5 scale)

3. View favorites/saves with counts

4. See users who engaged with specific exercises

⚡ Technical Highlights

1. Well-documented API endpoints

2. Comprehensive unit tests

3. Database migrations support

4. Optimized queries with multi-column indexes

5. Clean architecture with DTO validation

Tech Stack:

1. Backend: NestJS, TypeScript

2. Database: PostgreSQL (TypeORM)

3. Auth: JWT, bcrypt

4. Testing: Jest

5. Docs: Swagger/OpenAPI

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) - v16 or above.
- [NestJS](https://nestjs.com/) framework.
- [PostgreSQL](https://www.postgresql.org/) or other relational database.
- [Git](https://git-scm.com/) for version control.

## Installation and Running

1. Clone the repository:

```bash
git clone https://github.com/Vibhor-Max/Rest-API-with-NestJS.git

2. Navigate to the project directory:

cd your-repository

3. Install dependencies:

npm instal

4. Running the Application:
To run the application in development mode, use the following command:

npm run start:dev

This will start the application, and you should be able to access it at http://localhost:3000.

5. Database Configuration:
Make sure your PostgreSQL database is running and properly configured. Update the .env file with your database credentials:

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
( Check the file src\data-source.ts for detailed information) 

6. Running Migrations
To apply the database migrations (e.g., after adding new columns or indexes), run the following command:

npm run typeorm:migration:run

7. Testing the Application
Unit Tests: To run the unit tests for the project, use the following command:

npm run test

8. Watch Mode: For continuous testing while coding, you can use:

npm run test:watch

9. API Documentation
Once the server is running, you can access the Swagger API documentation at:

http://localhost:3000/api
This documentation provides detailed information about each endpoint, the request and response formats, and any other relevant details.
