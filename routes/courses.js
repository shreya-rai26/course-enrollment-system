const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT c.CourseID, c.CourseName, c.Capacity,
             COUNT(e.EnrollmentID) AS Enrolled,
             c.Capacity - COUNT(e.EnrollmentID) AS RemainingSeats
      FROM Courses c
      LEFT JOIN Enrollments e ON c.CourseID = e.CourseID
      GROUP BY c.CourseID, c.CourseName, c.Capacity
      ORDER BY c.CourseID
    `);
    res.json({success: true, data: result.recordset});
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
});

module.exports = router;
