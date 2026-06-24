// services/email.service.js
// const nodemailer = require('nodemailer');

// class EmailService {
//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'mdrakibulhasan12346@gmail.com',
//         pass: 'rbyz nvgi eppd rwqm',
//       },
//     });
//   }

//   async sendMail(to, subject, text, html) {
//     try {
//       const mailOptions = {
//         from: `"Omesh Team" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         text,
//         html,
//       };

//       const info = await this.transporter.sendMail(mailOptions);
//       console.log('✅ Email sent: ' + info.response);
//       return info;
//     } catch (error) {
//       console.error('❌ Email error:', error);
//       throw new Error('Failed to send email');
//     }
//   }
// }

// module.exports = EmailService;

// require('dotenv').config();

// class EmailService {
//   constructor() {
//     this.apiUrl = 'https://api.brevo.com/v3/smtp/email';
//     this.apiKey = process.env.BREVO_API_KEY;
//   }

//   async sendMail(to, subject, text, html) {
//     try {
//       const emailData = {
//         sender: {
//           name: 'Omesh Team',
//           email: 'bikash.maktech@gmail.com',
//         },
//         to: [{ email: to }],
//         subject: subject,
//         textContent: text,
//         htmlContent: html,
//       };

//       const response = await fetch(this.apiUrl, {
//         method: 'POST',
//         headers: {
//           accept: 'application/json',
//           'api-key': this.apiKey,
//           'content-type': 'application/json',
//         },
//         body: JSON.stringify(emailData),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || 'Brevo API Error');
//       }

//       console.log(
//         ' Email sent successfully via Direct API! Message ID:',
//         result.messageId,
//       );
//       return result;
//     } catch (error) {
//       console.error('❌ Brevo API error:', error.message);
//       throw new Error('Failed to send email');
//     }
//   }
// }

// module.exports = EmailService;

// class EmailService {
//   constructor() {
//     this.apiUrl = 'https://api.mailjet.com/v3.1/send';
//     this.apiKey = '9adbbfdae9ce00de7a0b9c9c74207a8f';
//     this.secretKey = '5578204b342c00d7d2ee74ff9af45665';
//   }

//   async sendMail(to, subject, text, html) {
//     try {
//       const emailData = {
//         Messages: [
//           {
//             From: {
//               Email: process.env.SENDER_EMAIL,
//               Name: process.env.SENDER_NAME,
//             },
//             To: [
//               {
//                 Email: to,
//               },
//             ],
//             Subject: subject,
//             TextPart: text,
//             HTMLPart: html,
//           },
//         ],
//       };

//       const auth = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString(
//         'base64',
//       );

//       const response = await fetch(this.apiUrl, {
//         method: 'POST',
//         headers: {
//           Authorization:
//             'Basic ' +
//             Buffer.from(this.apiKey + ':' + this.secretKey).toString('base64'),
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(emailData),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.ErrorMessage || 'Mailjet API Error');
//       }

//       console.log('✅ Email sent successfully via Mailjet API!');
//       return result;
//     } catch (error) {
//       console.error('❌ Mailjet API error:', error.message);
//       throw new Error('Failed to send email');
//     }
//   }
// }

// module.exports = EmailService;

const Mailjet = require('node-mailjet');
require('dotenv').config();

class EmailService {
  constructor() {
    this.mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY,
    );
  }

  async sendMail(to, subject, text, html) {
    try {
      const result = await this.mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.SENDER_EMAIL,
                Name: 'Endura Events.',
              },
              To: [
                {
                  Email: to,
                },
              ],
              Subject: subject,
              TextPart: text,
              HTMLPart: html,
            },
          ],
        });

      console.log('✅ Email sent successfully via Mailjet Package!');
      return result.body;
    } catch (error) {
      console.error(
        '❌ Mailjet Package error:',
        error.statusCode,
        error.message,
      );
      throw new Error('Failed to send email');
    }
  }
}

module.exports = EmailService;
