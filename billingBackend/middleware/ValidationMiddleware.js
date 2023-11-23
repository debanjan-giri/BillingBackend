import { validationResult, check } from "express-validator";

const validation = [
  check("username").isEmail().normalizeEmail(),
  check("password").isLength({ min: 8 }),

  // for more secure password
  // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'g')
  // .withMessage('uppercase,lowercase,number,special char'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

export default validation;
