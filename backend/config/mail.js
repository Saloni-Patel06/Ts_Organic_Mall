const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'tsorganicmall0623@gmail.com',
        pass: 'enbx lhuf qtgz yxtq',
    },
    tls: {
        rejectUnauthorized: false
    },
});

module.exports = transporter;