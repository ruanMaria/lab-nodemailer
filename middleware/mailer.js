'use strict';
const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PW,
    }
});

function sendConfirmation(user) {
    transport.sendMail ({
    from: '"Buu" <process.env.MAIL>', 
    to: `${user.email}`, 
    subject: 'Hello', 

    html: `<b>Hello world?</b>
    please confirm your email clicking <a href="http://localhost:3000/auth/confirm-email/${user.confirmationCode}` 
  });
}

main().catch(console.error);

module.exports = sendConfirmation;