const { validationResult } = require('express-validator');

/**
 * Run after a chain of express-validator checks.
 * Returns 422 with error details if validation fails.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors: formatted });
  }
  next();
};

module.exports = { handleValidation };
