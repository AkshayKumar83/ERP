const nodemailer = require('nodemailer');
require('dotenv').config();

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST, 
//     port: process.env.EMAIL_PORT,
//     secure: false,
//     auth: {
//         user: process.env.REDIFF_EMAIL,
//         pass: process.env.REDIFF_PASSWORD 
//     },
//     name:process.env.DOMAIN_NAME
// });


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // for 587
    auth: {
        user: process.env.SENDGRID_USER,   // ✅ "apikey"
        pass: process.env.SENDGRID_PASS    // ✅ API KEY
    }
});



// const sendEmail = async (toEmail, subject, html, attachmentPath = null) => {
//     const mailOptions = {
//         // from: process.env.REDIFF_EMAIL,
//         from: process.env.EMAIL_FROM,
//         to: toEmail,
//         subject,
//         html,
//         ...(attachmentPath && {
//             attachments: [
//                 {
//                     filename: 'invoice.pdf',
//                     path: attachmentPath
//                 }
//             ]
//         })
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.response);
//         return info;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };



// const sendEmail = async (toEmail, subject, html, attachmentPath = null) => {
//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: toEmail,
//         subject,
//         html,
//         ...(attachmentPath && {
//             attachments: [
//                 {
//                     filename: 'invoice.pdf',
//                     path: attachmentPath
//                 }
//             ]
//         })
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.response);
//         return info;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };

const sendEmail = async (toEmail, subject, html, attachmentPath = null, filename = null) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject,
        html,
        ...(attachmentPath && {
            attachments: [
                {
                    filename: filename || 'invoice.pdf',
                    path: attachmentPath
                }
            ]
        })
    };

    try {



        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// const sendPOEmail = async (toEmail, subject, html, attachmentPath = null) => {
//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: toEmail,
//         subject,
//         html,
//         ...(attachmentPath && {
//             attachments: [
//                 {
//                     filename: 'Purchase_Order.pdf',
//                     path: attachmentPath
//                 }
//             ]
//         })
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.response);
//         return info;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };

const sendPOEmail = async (toEmail, subject, html, attachmentPath = null, filename) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject,
        html,
        ...(attachmentPath && {
            attachments: [
                {
                    filename: filename || 'Purchase_Order.pdf',
                    path: attachmentPath
                }
            ]
        })
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};



// below sendingEmail is for multiple attahcment
const sendMultipleAttachmentsEmail = async (
    toEmail,
    subject,
    html,
    attachments = []
) => {

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject,
        html,
        attachments
    };

    try {

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.response);

        return info;

    } catch (error) {

        console.error('Error sending email:', error);

        throw error;
    }
};


module.exports = { sendEmail, sendPOEmail, sendMultipleAttachmentsEmail };
