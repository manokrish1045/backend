const router = require('express').Router()
const { createUser, signin, verifyEmai, verifyEmail, forgotpassword, resetPssword } = require('../controllers/usercon')
const { isResetTokenvalid } = require('../middleware/userforgetpass')
const { validateUser, validate } = require('../middleware/validator')

router.post('/create', validateUser, validate, createUser)
router.post('/signin', signin)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotpassword)
router.post('/reset-password', isResetTokenvalid, resetPssword)
router.post('/verify-token', isResetTokenvalid, (req, res) => {
    res.json({ success: true })
})





module.exports = router