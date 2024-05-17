const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const { contactUs } = require("../controllers/contactController")
contactUs

router.post("/", protect, contactUs)

module.exports = router