const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
})

const signupLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many signup attempts')
const apiLimiter = createRateLimit(15 * 60 * 1000, 100, 'Too many requests')

// Validation rules
const signupValidation = [
  body('alias').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9._-]+$/),
  body('interests').isLength({ min: 1, max: 500 }).trim()
]

const messageValidation = [
  body('message').isLength({ min: 1, max: 1000 }).trim()
]

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }
  next()
}

module.exports = {
  signupLimiter,
  apiLimiter,
  signupValidation,
  messageValidation,
  validate
}