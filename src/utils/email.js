// services/email.service.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mdrakibulhasan12346@gmail.com',
        pass: 'rbyz nvgi eppd rwqm',
      },
    });
  }

  async sendMail(to, subject, text, html) {
    try {
      const mailOptions = {
        from: `"Omesh Team" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error('❌ Email error:', error);
      throw new Error('Failed to send email');
    }
  }
}

module.exports = EmailService;

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
