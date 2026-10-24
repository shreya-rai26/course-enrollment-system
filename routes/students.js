const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      'SELECT StudentID, Name, Email FROM Students ORDER BY StudentID'
    );
    res.json({success: true, count: result.recordset.length, data: result.recordset});
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
});

module.exports = router;
