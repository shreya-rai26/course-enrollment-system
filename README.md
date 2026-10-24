# Course Enrollment System

REST API using Node.js, Express.js and Microsoft SQL Server.

## Setup
1. Run `database.sql` in SQL Server.
2. Copy `.env.example` to `.env` and enter your SQL Server credentials.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Endpoints
- GET `/`
- GET `/students`
- GET `/courses` — course capacity and remaining seats
- POST `/enrollments` — enroll student
- DELETE `/enrollments` — cancel enrollment
- GET `/enrollments/student/:studentId` — student's courses

The enrollment operation checks student/course existence, prevents duplicate enrollment and full courses, and uses a SQL transaction.

Do not commit `.env` or `node_modules`.
