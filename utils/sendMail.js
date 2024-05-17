
const nodemailer = require("nodemailer")

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD,
        },
        //toavoid error: self signed certificate
        tls: {
            rejectUnauthorized: false
        }
    })

    //options for sending email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        from: sent_from,
        subject: subject,
        html: message
    }

    //send email
    transporter.sendMail(options, function (err, info) {
        if (err) {
            console.log("Error: ", err)
        } else {
            console.log("Info: ", info)
        }
    })
}


module.exports = sendEmail