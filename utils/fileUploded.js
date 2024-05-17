//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files

//this file helps to upload file using multer

const multer = require("multer")

//define file storage - this piece of code is frm https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {  //this defines where to store the file
        cb(null, 'uploads')  //uploads folder is specified in server js
    },
    filename: function (req, file, cb) {   // this defines the file name
        cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname)  // in date 27/01/2024 replace / globally wth -
    }
})

//specify file format that can be saved

function fileFilter(req, file, cb) {
    //to filter png , jpeg, jpg
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true)   // allow files to upload
    }
    else {
        cb(null, false)
    }
}

//define upload parameter to use in diff parts of the code
const upload = multer({ storage, fileFilter })

// File Size Formatter
const fileSizeFormatter = (bytes, decimal) => {
    if (bytes === 0) {
        return "0 Bytes";
    }
    const dm = decimal || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (
        parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]
    );
};

//export modules
module.exports = { upload, fileSizeFormatter }