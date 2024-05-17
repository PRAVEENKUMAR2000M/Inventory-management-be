const express = require("express")
const { registerUser, loginUser, logoutUser, getUser, loginStatus, updateUser, changePwd, forgotPwd, resetPwd } = require("../controllers/userControllers")
const router = express.Router()
const protect = require("../middleware/authMiddleware")


router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/logout", logoutUser)
router.get("/getuser", protect, getUser)   //protect middleware will verify cookie token
router.get("/loggedin", loginStatus) //to check if user logged in
router.patch("/updateuser", protect, updateUser) //to update user provided details
router.patch("/changepwd", protect, changePwd) //to change pwd
router.post("/forgotpwd", forgotPwd) //to forget pwd and get link in email
router.put("/resetpwd/:resetToken", resetPwd) //to reset pwd



module.exports = router