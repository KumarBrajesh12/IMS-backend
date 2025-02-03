const pool = require("../config/database");

const markController = {
  // get subjects
  getSubjects: async (req, res) => {
    try {
      // Simple query to get all subjects without pagination
      const result = await pool.query(
        "SELECT id, name, created_at FROM subjects ORDER BY created_at DESC"
      );

      // Return response
      res.json({
        status: "success",
        data: result.rows,
      });
    } catch (error) {
      console.error("Error getting subjects:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch subjects",
      });
    }
  },
  // Get student marks
  getStudentMarks: async (req, res) => {
    try {
      const { id } = req.params;

      // First check if student exists
      const studentCheck = await pool.query(
        "SELECT * FROM students WHERE id = $1",
        [id]
      );

      if (studentCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      // Get marks with subject information
      const result = await pool.query(
        `SELECT 
                    m.id,
                    m.score,
                    m.exam_date,
                    s.name as subject_name,
                    s.code as subject_code
                FROM marks m
                JOIN subjects s ON m.subject_id = s.id
                WHERE m.student_id = $1
                ORDER BY m.exam_date DESC`,
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

  // Add marks for student
  addStudentMarks: async (req, res) => {
    try {
      const { id } = req.params;
      const { subject_id, score, exam_date } = req.body;

      // Validate score
      if (score < 0 || score > 100) {
        return res.status(400).json({
          status: "error",
          message: "Score must be between 0 and 100",
        });
      }

      // Check if student exists
      const studentCheck = await pool.query(
        "SELECT * FROM students WHERE id = $1",
        [id]
      );

      if (studentCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Student not found",
        });
      }

      // Check if subject exists
      const subjectCheck = await pool.query(
        "SELECT * FROM subjects WHERE id = $1",
        [subject_id]
      );

      if (subjectCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Subject not found",
        });
      }

      // Check if mark already exists for this subject and date
      const existingMark = await pool.query(
        "SELECT * FROM marks WHERE student_id = $1 AND subject_id = $2 AND exam_date = $3",
        [id, subject_id, exam_date]
      );

      if (existingMark.rows.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Mark already exists for this subject and date",
        });
      }

      // Insert mark
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

  // Update student mark
  updateStudentMark: async (req, res) => {
    try {
      const { id, markId } = req.params;
      const { score } = req.body;

      // Validate score
      if (score < 0 || score > 100) {
        return res.status(400).json({
          status: "error",
          message: "Score must be between 0 and 100",
        });
      }

      const result = await pool.query(
        `UPDATE marks 
                SET score = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND student_id = $3
                RETURNING *`,
        [score, markId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Mark not found",
        });
      }

      res.json({
        status: "success",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating student mark:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Delete student mark
  deleteStudentMark: async (req, res) => {
    try {
      const { id, markId } = req.params;

      const result = await pool.query(
        "DELETE FROM marks WHERE id = $1 AND student_id = $2 RETURNING *",
        [markId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Mark not found",
        });
      }

      res.json({
        status: "success",
        message: "Mark deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting student mark:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};

module.exports = markController;
