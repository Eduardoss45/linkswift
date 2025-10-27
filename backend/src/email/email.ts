import 'dotenv/config';
import nodemailer from 'nodemailer';
import { EmailData } from './email.types';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APPLICATION_USER,
    pass: process.env.APPLICATION_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, content, options }: EmailData) => {
  const mailOptions = {
    from: 'Linkswift',
    to,
    subject,
    ...(options?.isHtml ? { html: content } : { text: content }),
  };
  await transporter.sendMail(mailOptions);
};