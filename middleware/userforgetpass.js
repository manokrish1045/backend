const User = require("../model/user")
const ResetToken = require("../model/resettoken")
const { sendError } = require("../utils/helper")
const { isValidObjectId } = require("mongoose")


exports.isResetTokenvalid = async (req, res, next) => {
    const { token, id } = req.query
    if (!token || !id) return sendError(res, "Invalid request")

    if (!isValidObjectId(id)) return sendError(res, "invalid user")

    const user = await User.findById(id)
    if (!user) return sendError(res, "user not found")

    const resetToken = await ResetToken.findOne({ owner: user._id })
    if (!resetToken) return sendError(res, "Reset token not found")

    const isValid = await resetToken.compareToken(token)
    if (!isValid) return sendError(res, "Reset token is invalid")
    req.user = user
    next()
}