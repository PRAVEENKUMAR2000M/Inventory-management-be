
const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const sendEmail = require("../utils/sendMail")


const contactUs = asyncHandler(async (req, res) => {

    //retrieve  form data
    const { subject, message } = req.body

    //find if user is available in db
    const user = await User.findById(req.user._id)

    if (!user) {
        res.status(400)
        throw new Error("User not found, please Signup")
    }

    //validation
    if (!subject || !message) {
        res.status(400)
        throw new Error("Please add subject and message")
    }

    const send_to = process.env.EMAIL_USER
    const sent_from = process.env.EMAIL_USER
    const reply_to = user.email

    //send email
    try {
        await sendEmail(subject, message, send_to, sent_from, reply_to)
        res.status(200).json({ success: true, message: "Email Sent" })
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }




})

module.exports = {
    contactUs
}