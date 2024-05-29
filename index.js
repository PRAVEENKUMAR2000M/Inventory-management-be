const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');

const productRoute = require("./routes/productRoutes");
const contactRoute = require("./routes/contactRoute");
const userRoute = require("./routes/usersRoute");
const app = express();
require("dotenv").config();

app.use(cors({
    origin: "http://localhost:5173",
    // methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS", "CONNECT", "TRACE"],
    // allowedHeaders: ["Content-Type", "Authorization", "X-Content-Type-Options", "Accept", "X-Requested-With", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
    credentials: true,
    // maxAge: 7200
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);

// Test root route
app.get("/", (req, res) => {
    res.send('Backend Application - Inventory Management Application');
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log(`Error: ${error.message}`);
    });

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
