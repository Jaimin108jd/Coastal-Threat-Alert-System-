import { Vonage } from '@vonage/server-sdk';
import nodemailer from 'nodemailer';

const vonage = new Vonage({
    apiKey: "3a933fe5",
    apiSecret: "Udit@4440",
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "buddycodez10@gmail.com",
        pass: "hlmf ljur deqp fnlh",
    },
});

export async function sendSMS(to: string, text: string) {
    return new Promise(async (resolve, reject) => {
        const from = "Vonage APIs"
        await vonage.sms.send({ to: "91" + to, from, text })
            .then(resp => { console.log('Message sent successfully ->', to); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });

    });
}

export async function sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
        from: "buddycodez101@gmail.com",
        to,
        subject,
        html,
    };

    return transporter.sendMail(mailOptions);
}
