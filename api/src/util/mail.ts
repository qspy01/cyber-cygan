import nodemailer from 'nodemailer';
import { env } from '../config.js';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    html,
  });
};
