//async fucntion includes try catch, inorder to avoid try catch,use asyncHandler package
const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")   //to connect user collection in database
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
// const { response } = require("express")
const Token = require("../models/tokenModel")
const crypto = require("crypto")
const sendEmail = require("../utils/sendMail")
const handlebars = require('handlebars');
const fs = require('fs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })
}

const registerUser = asyncHandler(async (req, res) => {
    //register user - code logic

    //retrieve data from request
    const { name, email, password } = req.body

    // requiredfield validation
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("please fill in all required fields")
    }
    //passwordvalidation
    if (password.length < 6) {
        res.status(400)
        throw new Error("please must be upto 6 characters")
    }
    //check if user email already exists, throw err
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("User EMAIL already been registered")
    }

    //else  create new user
    const user = await User.create({
        name, email, password
    })

    //generate token
    const token = generateToken(user._id)

    //send http only cookie to front end- the res is used to handle login and logout 
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",  //this executes when deployed
        secure: true            //to use cookie only with https
    })


    //send success/err response 
    if (user) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(200).json({
            _id, name, email, photo, phone, bio
        })
    }
    else {
        res.status(400)
        throw new Error("Invalid user data")
    }

})

const loginUser = asyncHandler(async (req, res) => {
    //loginuser - code logic

    //get user email, pwd from req body
    const { email, password } = req.body

    //validate req
    // requiredfield validation
    if (!email || !password) {
        res.status(400)
        throw new Error("please add valid email and password")
    }

    //checkif user exist in db
    const user = await User.findOne({ email })

    //if user not found
    if (!user) {
        res.status(400)
        throw new Error("User not found,please Signup")
    }

    //user exists, check if password matches using bcrypt
    const PasswordMatch = await bcrypt.compare(password, user.password)

    //generate token
    const token = generateToken(user._id)

    //send http only cookie to front end- the res is used to handle login and logout 
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",  //this executes when deployed
        secure: true            //to use cookie only with https
    })


    if (user && PasswordMatch) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(201).json({
            _id, name, email, photo, phone, bio
        })
    }
    else {
        res.status(400)
        throw new Error("Invalid Email or Password")
    }

})

//logout user
const logoutUser = asyncHandler(async (req, res) => {
    //reset cookieto expire when on logout
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), //epires
        sameSite: "none",  //this executes when deployed
        secure: true            //to use cookie only with https
    })
    return res.status(200).json({ message: "Successfully Logged out" })
})

//get user data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(200).json({
            _id, name, email, photo, phone, bio
        })
    }
    else {
        res.status(400)
        throw new Error("User Not Found")
    }

})

//get login status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token

    if (!token) {
        return res.json(false)   //if not loged in , status will be false
    }

    //verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (verified) {
        return res.json(true)
    }

    return res.json(false)

})

//upate user details
const updateUser = asyncHandler(async (req, res) => {
    // get the user detais from db
    const user = await User.findById(req.user._id)

    //if user available, destructure the  values
    if (user) {
        const { name, email, photo, phone, bio } = user

        //update each parameter by the value from req.body
        user.email = email,
            user.name = req.body.name || name
        user.phone = req.body.phone || phone
        user.bio = req.body.bio || bio
        user.photo = req.body.photo || photo

        const updatedUser = await user.save()
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        })
    }
    else {
        res.status(400)
        throw new Error("User Not Found")
    }
})

//change pwd
const changePwd = asyncHandler(async (req, res) => {
    // get the pwd detailsfrom req
    const { oldPassword, password } = req.body

    // get the user detais from db
    const user = await User.findById(req.user._id)

    //if user not found
    if (!user) {
        res.status(400)
        throw new Error("User not found,please Signup")
    }

    //validate req
    if (!oldPassword || !password) {
        res.status(400)
        throw new Error("please add valid old and new password")
    }

    //check if old pwd matches password in db
    const pwdIsCorrect = await bcrypt.compare(oldPassword, user.password)

    //save
    if (user && pwdIsCorrect) {
        user.password = password
        await user.save()
        res.status(200).send("password change successful")
    }
    else {
        res.status(400).send("old pwd is incorrect")

    }

})

//forgt pwd and get reset link in email
const forgotPwd = asyncHandler(async (req, res) => {
    //get email from req
    const { email } = req.body

    //check if email is avail
    const user = await User.findOne({ email })

    //if user not avai
    if (!user) {
        res.status(404)
        throw new Error("User does not exists")
    }

    //delete tokenif already exists in database as it might expired
    let token = await Token.findOne({ userID: user._id })
    if (token) {
        await token.deleteOne()
    }

    //create new reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken)

    //hast the token before save it to db
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    //save the token to db token collection
    await new Token({
        userID: user._id,
        token: hashedToken,
        createAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000) //thirty minutes
    }).save()

    //construct reset url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpwd/${resetToken}`

    //generate reset email
    const message = `
                    <h3>Hello ${user.name}<h3/>
                    <p>Please use the below url to reset your password</p>
                    <p>This reset link is valid only for 30 minutes</p>
                    <a href=${resetUrl} clicktracking="off">${resetUrl}</a>
                    <p> Regards...</p>
                    <p>Inventory Management Team</p>
    `
    const subject = "Password Reset Request"
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER
    const reply_to = process.env.EMAIL_USER

    //send email
    try {
        await sendEmail(subject, message, send_to, sent_from, reply_to)
        res.status(200).json({ success: true, message: "Reset Email Sent" })
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }

})

//reset pwd - giving new pwd using mail link
const resetPwd = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { resetToken } = req.params

    //hast the token , compare to token in db
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    //find token in db
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() }
    })

    if (!userToken) {
        res.status(500)
        throw new Error("Invalid or Expired Token")
    }

    //find user id
    const user = await User.findOne({ _id: userToken.userID })
    user.password = password

    try {
        //save new pwd
        await user.save()
        res.status(200).json({ messsage: "Password reset successful, please login" })
    }
    catch (error) {
        res.status(404)
        throw new Error(error)
    }


})

module.exports = {
    registerUser, loginUser, logoutUser, getUser, loginStatus, updateUser, changePwd, forgotPwd, resetPwd
}