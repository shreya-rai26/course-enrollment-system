const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

router.post('/', async (req, res) => {
  const { studentId, courseId } = req.body;
  if (!Number.isInteger(studentId) || !Number.isInteger(courseId)) {
    return res.status(400).json({success: false, message: 'studentId and courseId must be integers'});
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const student = await transaction.request()
      .input('studentId', sql.Int, studentId)
      .query('SELECT StudentID FROM Students WHERE StudentID=@studentId');
    if (!student.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({success: false, message: 'Student not found'});
    }

    const course = await transaction.request()
      .input('courseId', sql.Int, courseId)
      .query('SELECT CourseID, CourseName, Capacity FROM Courses WHERE CourseID=@courseId');
    if (!course.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({success: false, message: 'Course not found'});
    }

    const duplicate = await transaction.request()
      .input('studentId', sql.Int, studentId)
      .input('courseId', sql.Int, courseId)
      .query('SELECT EnrollmentID FROM Enrollments WHERE StudentID=@studentId AND CourseID=@courseId');
    if (duplicate.recordset.length) {
      await transaction.rollback();
      return res.status(409).json({success: false, message: 'Student is already enrolled in this course'});
    }

    const seats = await transaction.request()
      .input('courseId', sql.Int, courseId)
      .query('SELECT COUNT(*) AS Enrolled FROM Enrollments WHERE CourseID=@courseId');

    if (seats.recordset[0].Enrolled >= course.recordset[0].Capacity) {
      await transaction.rollback();
      return res.status(409).json({success: false, message: 'Course is full'});
    }

    const inserted = await transaction.request()
      .input('studentId', sql.Int, studentId)
      .input('courseId', sql.Int, courseId)
      .query(`
        INSERT INTO Enrollments (StudentID, CourseID)
        OUTPUT INSERTED.EnrollmentID, INSERTED.StudentID, INSERTED.CourseID, INSERTED.EnrollmentDate
        VALUES (@studentId, @courseId)
      `);

    await transaction.commit();
    res.status(201).json({success: true, message: 'Enrollment successful', data: inserted.recordset[0]});
  } catch (err) {
    try { await transaction.rollback(); } catch (_) {}
    res.status(500).json({success: false, message: err.message});
  }
});

router.delete('/', async (req, res) => {
  const { studentId, courseId } = req.body;
  if (!Number.isInteger(studentId) || !Number.isInteger(courseId)) {
    return res.status(400).json({success: false, message: 'studentId and courseId must be integers'});
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('courseId', sql.Int, courseId)
      .query(`
        DELETE FROM Enrollments
        OUTPUT DELETED.EnrollmentID, DELETED.StudentID, DELETED.CourseID
        WHERE StudentID=@studentId AND CourseID=@courseId
      `);
    if (!result.rowsAffected[0]) {
      return res.status(404).json({success: false, message: 'Enrollment not found'});
    }
    res.json({success: true, message: 'Enrollment cancelled', data: result.recordset[0]});
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
});

router.get('/student/:studentId', async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId)) {
    return res.status(400).json({success: false, message: 'Invalid student ID'});
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT s.StudentID, s.Name AS StudentName,
               c.CourseID, c.CourseName, e.EnrollmentDate
        FROM Enrollments e
        INNER JOIN Students s ON e.StudentID=s.StudentID
        INNER JOIN Courses c ON e.CourseID=c.CourseID
        WHERE e.StudentID=@studentId
        ORDER BY c.CourseID
      `);
    res.json({success: true, count: result.recordset.length, data: result.recordset});
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
});

module.exports = router;
