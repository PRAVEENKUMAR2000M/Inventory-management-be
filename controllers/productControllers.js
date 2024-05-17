//async fucntion includes try catch, inorder to avoid try catch,use asyncHandler package
const asyncHandler = require("express-async-handler")
const Product = require("../models/productModels")
const { fileSizeFormatter } = require("../utils/fileUploded")
const cloudinary = require("cloudinary").v2

//add new product
const createProduct = asyncHandler(async (req, res) => {
    //retrieve values from body
    const { name, sku, category, quantity, price, description } = req.body

    //validation
    if (!name || !category || !quantity || !price || !description || !sku) {
        res.status(400)
        throw new Error("Please fill in all the fields")
    }

    //Handle image upload 
    let fileData = {}
    if (req.file) {

        //save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "Invent Manage App", resource_type: "image" })
            //req.file.path- file upload path inside project
        } catch (error) {
            res.status(500)
            throw new Error("Image could not be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,  //cloudinary url
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)   //give size in bytes to kb
        }
    }

    //create product and add this to Product collection
    const product = await Product.create({
        user: req.user._id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    })

    if (product) {
        console.log("Product created successful")
        res.status(201).json(product)
    }
    else {
        console.log("Error creating Product")
        res.status(400)
        throw new Error("Product not added, Try again!")
    }

})

//get all product specific to user id
const getAllProduct = asyncHandler(async (req, res) => {

    //userid from protect middleware
    const products = await Product.find({ user: req.user._id }).sort("-createdAt")    // sort by createdAt desc (latest to old)
    res.status(200).json(products)
})

//get products specific to product id
const getSingleProduct = asyncHandler(async (req, res) => {

    //product id from req url
    const products = await Product.findById(req.params.id)

    //if product not available
    if (!products) {
        res.status(404)
        throw new Error("Product not found")
    }

    //check if product belongs to the loggedin user
    if (products.user.toString() != req.user.id) {
        res.status(401)
        throw new Error("User Not Authorized")
    }

    res.status(200).json(products)

})

//delete product
const deleteProduct = asyncHandler(async (req, res) => {

    //find product
    const product = await Product.findById(req.params.id)

    //if product not available
    if (!product) {
        res.status(404)
        throw new Error("Product not found")
    }

    //check if product belongs to the loggedin user
    if (product.user.toString() != req.user.id) {
        res.status(401)
        throw new Error("User Not Authorized")
    }

    //const deleteResult = await myColl.deleteOne(doc);
    const deleteResult = await Product.deleteOne({ _id: product._id });

    res.status(200).json({ message: deleteResult });

})

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params

    //retrieve values from body
    const { name, sku, catagory, quantity, price, description } = req.body

    //find product details by params id
    const product = await Product.findById(id)

    //if product not available
    if (!product) {
        res.status(404)
        throw new Error("Product not found")
    }

    //check if product belongs to the loggedin user
    if (product.user.toString() != req.user.id) {
        res.status(401)
        throw new Error("User Not Authorized")
    }

    //Handle image upload 
    let fileData = {}
    if (req.file) {
        //save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "Invent Manage App", resource_type: "image" })
            //req.file.path- file upload path inside project
        } catch (error) {
            res.status(500)
            throw new Error("Image could not be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,  //cloudinary url
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)   //give size in bytes to kb
        }
    }

    //update product to existing
    const updateProduct = await Product.findByIdAndUpdate(
        { _id: id },
        {
            name,
            catagory,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? product?.image : fileData,
            //check if file data is empty and retain original image else upload new image
        },
        {
            new: true,
            runValidators: true  //check if all the schema conditions metrs
        }
    )

    res.status(200).json(updateProduct)
})


module.exports = {
    createProduct, getAllProduct, getSingleProduct, deleteProduct, updateProduct
}