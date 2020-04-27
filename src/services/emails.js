/* eslint-disable prefer-destructuring, class-methods-use-this */
import path from 'path';
import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import { config } from 'dotenv';

config();

export default class Email {
  constructor(user, url) {
    this.to = user.local.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_ADDRESS;
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_API_KEYNAME,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const mailPath = path.join(__dirname, '../views/emails');
    const html = pug.renderFile(`${mailPath}/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: 'Naijafotos Admin admin@naijafotos.com',
      to: this.to,
      subject,
      text: htmlToText.fromString(html),
      html,
    };

    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcomeMail() {
    await this.send('welcome', 'Welcome to Naijafotos');
  }

  async sendPasswordResetMail() {
    await this.send('password-reset', 'Reset Password (valid for 1 hour)');
  }
}
