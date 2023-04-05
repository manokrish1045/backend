const User = require('../model/user')
const { sendError, createRandomBytes } = require('../utils/helper')
const jwt = require("jsonwebtoken")
const { generateOtp, mailtransport, generateEmail, plainemail, generatePasswordReseturl, plainemail1 } = require('../utils/mailotp')
const VerificationToken = require('../model/verifyToken')
const { isValidObjectId } = require('mongoose')
const ResetToken = require('../model/resettoken')


exports.createUser = async (req, res) => {
    const { name, email, password } = req.body
    const user = await User.findOne({ email })
    if (user)
        return sendError(res, "email already exist");

    const newUser = new User({
        name,
        email,
        password,
    })

    const OTP = generateOtp()

    const verificationToken = new VerificationToken({
        owner: newUser._id,
        token: OTP
    })

    await verificationToken.save()
    await newUser.save()

    mailtransport().sendMail({
        from: "manokrish104525@gmail.com",
        to: newUser.email,
        subject: "Verify your email",
        html: generateEmail(OTP),
    })

    res.send(newUser)
}
exports.signin = async (req, res) => {
    const { email, password } = req.body
    if (!email.trim() || !password.trim()) return sendError(res, "email/password mising")

    const user = await User.findOne({ email })
    if (!user) return sendError(res, 'user not found')

    const isMatched = await user.comparePassword(password)
    if (!isMatched) return sendError(res, "email/password doesnt match")

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })

    res.json({
        success: true,
        user: { name: user.name, email: user.email, id: user._id, token: token }
    })
}

exports.verifyEmail = async (req, res) => {
    const { userId, otp } = req.body
    if (!userId || !otp.trim()) return sendError(res, "invalid or missing parameter")

    if (!isValidObjectId(userId)) return sendError(res, "invalid user id")
    const user = await User.findById(userId)
    if (!user) return sendError(res, "user not valid")

    if (user.verified) return sendError(res, "Already verifies")

    const token = await VerificationToken.findOne({ owner: user._id })
    if (!jwt.TokenExpiredError) return sendError(res, "Sorry userNot found")

    const isMatched = await token.compareToken(otp)
    if (!isMatched) return sendError(res, "Please provide valid token")

    user.verified = true;

    await VerificationToken.findByIdAndDelete(token._i)
    await user.save()

    mailtransport().sendMail({
        from: "manokrish104525@gmail.com",
        to: user.email,
        subject: "Verify your email",
        html: plainemail(
            "Email verified succesfully",
            "Thanks for connecting with us"
        ),
    })
    res.json({ success: true, message: "email is verified", user: { name: user.name, email: user.email, id: user._id } })
}

exports.forgotpassword = async (req, res) => {
    const { email } = req.body
    if (!email) return sendError(res, "Please enter a valid email")
    const user = await User.findOne({ email })
    if (!user) return sendError(res, " User not found")

    const token = await ResetToken.findOne({ owner: user._id })
    if (token) return sendError(res, "after one hour you can request another token")

    const rantoken = await createRandomBytes()
    const resetToken = new ResetToken({ owner: user._id, token: rantoken })
    await resetToken.save()

    mailtransport().sendMail({
        from: "security@gmail.com",
        to: user.email,
        subject: "Password Reset",
        html: generatePasswordReseturl(
            `http://localhost:3000/reset-password?token=${rantoken}&id=${user._id}`
        ),
    })

    res.json({ success: true, message: "link is sent to email" })

}


exports.resetPssword = async (req, res) => {
    const { password } = req.body

    const user = await User.findById(req.user._id)
    if (!user) sendError(res, "user not found")

    const isSamePassword = await user.comparePassword(password)
    if (isSamePassword) return sendError(res, "new password must be different")

    if (password.trim().length < 8 || password.trim().length > 20)
        return sendError(res, " Password Must be 8 to 20 character")

    user.password = password.trim()
    await user.save()

    await ResetToken.findOneAndDelete({ owner: user._id })
    mailtransport().sendMail({
        from: "security@gmail.com",
        to: user.email,
        subject: "Password Reset",
        html: plainemail1(
            "Password reset succesfully"
        )
    })
    res.json({ sucess: true, message: "Password Reset Sucessfully" })
} 