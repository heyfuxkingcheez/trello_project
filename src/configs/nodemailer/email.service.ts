import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('NODE_MAIL_ID'),
        pass: this.configService.get('NODE_MAIL_PW'),
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('NODE_MAIL_ID'),
      to: to,
      subject: '시속400km 인증메일',
      text: `인증번호: ${code}`,
      html: `
      <div style='
      margin: 0 auto 0 auto;
      padding: 3.5% 0 5% 0;
      text-align: center;
      border: 0.5px solid #ececec;
      height: 50%;
      width: 50%;
      '>

      
      <span style="
      font-size: 30pt;
      border: 0.5px solid #ececec;
      padding: 0.5% 2.5%;
      font-weight:bold;
      ">${code}</span>
      <br/>
      <h2>인증번호는 3분간 유효합니다.</h2><br/><br/><br/>
      <h4 style="
      color: gray;
      ">
      &copy; Copyright 400km/h, 2024 All Rights Reserved.
      </h4>
      </div>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
