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

export async function enviarEmail(
  to: string,
  subject: string,
  content: string,
  options?: { isHtml?: boolean }
): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"LinkSwift" <${process.env.USERAPP}>`,
      to,
      subject,
      ...(options?.isHtml ? { html: content } : { text: content }),
    });

    console.log('E-mail enviado:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}
