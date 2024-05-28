//import mongoose
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true,   // removes spacce around
    },
    sku: {     //unique no
        type: String,
        required: true,    //generated from FE
        default: "SKU",
        trim: true,
    },
    catagory: {
        type: String,
        required: [true, "Please add a catagory"],
        trim: true,
    },
    quantity: {
        type: String,
        required: [true, "Please add a quantity"],
        trim: true,
    },
    price: {
        type: String,
        required: [true, "Please add a price"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please add a descripton"],
        trim: true,
    },
    image: {
        type: Object,
        default: []  // removes spacce around
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model("product", productSchema)