const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const path = require("path")
const cookieParser = require('cookie-parser');

const productRoute = require("./routes/productRoutes")
const contactRoute = require("./routes/contactRoute")
const userRoute = require("./routes/usersRoute")
const app = express()
require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use(cookieParser());



//routes Middleware
app.use("/api/users", userRoute)
app.use("/api/products", productRoute)
app.use("/api/contactus", contactRoute)

//test root route
app.get("/", (req, res) => {
    res.send('Backend Application - Inventory Management Application')
})

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
    console.log("mongodb connected")
    })
    .catch((error) => {
    console.log(`error`, error.message)
    })

app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`)
})