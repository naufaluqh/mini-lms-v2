const express = require('express');
const router = express.Router();
const { exportToExcel, issueCertificate } = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all reporting routes
router.use(protect);

// GET /api/reports/excel (admin and manager only)
router.get('/excel', restrictTo('admin', 'manager'), exportToExcel);

// POST /api/reports/certificate (authenticated users)
router.post('/certificate', issueCertificate);

module.exports = router;
