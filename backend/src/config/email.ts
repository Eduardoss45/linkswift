import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USERAPP,
    pass: process.env.PASSAPP,
  },
});

/*
 * @param to - Email do destinatário
 * @param subject - Assunto do e-mail
 * @param text - Corpo do e-mail
 */

export async function enviarEmail(to: string, subject: string, text: string): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"LinkSwift" <${process.env.USERAPP}>`,
      to,
      subject,
      text,
    });
    console.log('E-mail enviado:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}
