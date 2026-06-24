const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
} = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all course routes
router.use(protect);

// GET /api/courses (All roles) & POST /api/courses (admin & manager only)
router.route('/')
  .get(getAllCourses)
  .post(restrictTo('admin', 'manager'), createCourse);

// POST /api/courses/:id/material (admin only)
router.post('/:id/material', restrictTo('admin'), addMaterial);

// GET, PUT, DELETE operations for specific course IDs
router.route('/:id')
  .get(getCourseById)
  .put(restrictTo('admin', 'manager'), updateCourse)
  .delete(restrictTo('admin', 'manager'), deleteCourse);

module.exports = router;
