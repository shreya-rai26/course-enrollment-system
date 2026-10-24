const express = require('express');
require('dotenv').config();
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => res.json({success: true, message: 'Course Enrollment System API is running'}));
app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use((req, res) => res.status(404).json({success: false, message: 'Route not found'}));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
