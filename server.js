const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use an "App Password" here
    }
});

// 1. Notification for Website Visit
app.get('/visit', (req, res) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Website Visit!',
        text: 'Someone just opened your Animal Adoption website.'
    };
    transporter.sendMail(mailOptions);
    res.send('Visit logged');
});

// 2. Handle Messages/Adoptions/Donations
app.post('/send-message', (req, res) => {
    const { type, name, message, email } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New ${type} Notification`,
        text: `From: ${name} (${email})\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) return res.status(500).send(error.toString());
        res.status(200).send('Message Sent!');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
