const validateStudent = (req, res, next) => {
    const { first_name, last_name, email, date_of_birth } = req.body;

    if (!first_name || !last_name || !email) {
        return res.status(400).json({
            status: 'error',
            message: 'First name, last name, and email are required'
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid email format'
        });
    }

    next();
};

const validateMarks = (req, res, next) => {
    const { subject_id, score, exam_date } = req.body;

    if (!subject_id || score === undefined || !exam_date) {
        return res.status(400).json({
            status: 'error',
            message: 'Subject ID, score, and exam date are required'
        });
    }

    if (score < 0 || score > 100) {
        return res.status(400).json({
            status: 'error',
            message: 'Score must be between 0 and 100'
        });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(exam_date)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid date format. Use YYYY-MM-DD'
        });
    }

    next();
};

module.exports = {
    validateStudent,
    validateMarks
};