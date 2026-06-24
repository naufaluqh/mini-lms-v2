const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private (All roles: admin, manager, karyawan)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private (All roles: admin, manager, karyawan)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`,
      });
    }
    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (admin, manager only)
exports.createCourse = async (req, res) => {
  try {
    const { title, instructor, materials } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required',
      });
    }

    const course = await Course.create({
      title,
      instructor,
      materials,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update an existing course
// @route   PUT /api/courses/:id
// @access  Private (admin, manager only)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (admin, manager only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add material module to course
// @route   POST /api/courses/:id/material
// @access  Private (admin only)
exports.addMaterial = async (req, res) => {
  try {
    const { material } = req.body;

    if (!material) {
      return res.status(400).json({
        success: false,
        message: 'Material content string is required',
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`,
      });
    }

    course.materials.push(material);
    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Material added successfully',
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
