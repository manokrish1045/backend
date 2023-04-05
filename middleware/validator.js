const { check, validationResult } = require('express-validator')


exports.validateUser = [
    check('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Name is missing')
        .isLength({ min: 3, max: 20 })
        .withMessage('name Must be 3 to 20 character'),
    check('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('email is invalid'),
    check('password')

        .not()
        .isEmpty()
        .withMessage('password is missing')
        .isLength({ min: 3, max: 8 })
        .withMessage('password Must be 3 to 20 character'),

]

exports.validate = (req, res, next) => {
    const error = validationResult(req).array()
    if (!error.length) return next()

    res.status(400).json({ success: false, error: error[0].msg })
}