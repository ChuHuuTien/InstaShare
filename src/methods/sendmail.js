const nodemailer = require('nodemailer');
const UserVerify = require('../models/userverify');

const sendMail = async (sendToMail, otp)=>{
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'chuhuutien01@gmail.com',
        pass: 'tsfevhanyrzuokvm'
        }
    });

    const mailOptions = {
        from: `[No Reply] InstaShare <chuhuutien01@example.com>`,
        to: sendToMail,
        subject: 'Authentication',
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">InstaShare</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing InstaShare. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        </div>
    </div>`
    };

    transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            const newUserVerify = {
                email: sendToMail,
                otp: otp,
            };
            try{
                const userVerify = await UserVerify.createUserVerify(newUserVerify);
                return userVerify;
            }catch(err){
                return false;
            }
        }
    })

}

module.exports = sendMail;