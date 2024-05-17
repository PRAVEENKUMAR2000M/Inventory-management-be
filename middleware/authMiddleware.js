const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401);
            throw new Error("Not authorized, Please login");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(verified.id).select("-password");

        if (!user) {
            res.status(401);
            throw new Error("User Not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protect middleware:", error.message);
        res.status(401).json({ error: "Not authorized, Please login" });
    }
});

module.exports = protect;
