// src/controllers/studentController.js
const pool = require("../config/database");

const studentController = {
  // Get all students
  getStudents: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const countResult = await pool.query("SELECT COUNT(*) FROM students");
      const total = parseInt(countResult.rows[0].count);

      const result = await pool.query(
        "SELECT * FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );

      res.json({
        status: "success",
        data: result.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error getting students:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Create new student
createStudent: async (req, res) => {
    try {
        const { first_name, last_name, email, date_of_birth } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'First name, last name, and email are required fields'
            });
        }

        const result = await pool.query(
            'INSERT INTO students (first_name, last_name, email, date_of_birth) VALUES ($1, $2, $3, $4) RETURNING *',
            [first_name, last_name, email, date_of_birth]
        );
        
        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
},
  // Get all students with pagination
  getAllStudents: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count of students
      const countResult = await pool.query("SELECT COUNT(*) FROM students");
      const total = parseInt(countResult.rows[0].count);

      // Get paginated students data
      const result = await pool.query(
        "SELECT * FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );

      // Return paginated response
      res.json({
        status: "success",
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting students:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get student by ID
  getStudentById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM students WHERE id = $1", [
        id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      res.json({
        status: "success",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error getting student:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Update student
  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, date_of_birth } = req.body;

      const result = await pool.query(
        "UPDATE students SET first_name = $1, last_name = $2, email = $3, date_of_birth = $4 WHERE id = $5 RETURNING *",
        [first_name, last_name, email, date_of_birth, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      res.json({
        status: "success",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Delete student
  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "DELETE FROM students WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      res.json({
        status: "success",
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get student marks
  getStudentMarks: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT m.*, s.name as subject_name 
                 FROM marks m 
                 JOIN subjects s ON m.subject_id = s.id 
                 WHERE m.student_id = $1`,
        [id]
      );

      res.json({
        status: "success",
        data: result.rows,
      });
    } catch (error) {
      console.error("Error getting student marks:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Add student marks
  addStudentMarks: async (req, res) => {
    try {
      const { id } = req.params;
      const { subject_id, score, exam_date } = req.body;

      const result = await pool.query(
        `INSERT INTO marks (student_id, subject_id, score, exam_date)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
        [id, subject_id, score, exam_date]
      );

      res.status(201).json({
        status: "success",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error adding student marks:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};

module.exports = studentController;
