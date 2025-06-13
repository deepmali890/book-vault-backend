const transporter = require("../config/mailer");

const sendVerificationEmail = async (to, name, token) => {
     const verificationUrl = `${process.env.FRONTEND_URL}/models/verifyemail?token=${token}&email=${to}`;

    const mailOptions = {
        from: `"Book Vault" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Verify Your Email, ${name} – Welcome to Book Vault 📚✨`,
        html: `
        <div style="
          font-family: Georgia, serif; 
          background: #fdf6e3; 
          color: #4b3b2b; 
          max-width: 600px; 
          margin: auto; 
          padding: 30px; 
          border-radius: 15px; 
          box-shadow: 0 0 15px rgba(75, 59, 43, 0.2);
        ">
          <h1 style="font-size: 28px; margin-bottom: 15px;">Hey ${name}, one last step 🚀</h1>
          <p style="font-size: 18px; line-height: 1.5; margin-bottom: 25px;">
            Thanks for joining <strong>Book Vault</strong> – your personal sanctuary of stories, wisdom, and wonder.
          </p>
          <p style="font-size: 16px; margin-bottom: 30px;">
            To get started, please <strong>verify your email</strong> by clicking the button below. It's quick, we promise.
          </p>
          <a href="${verificationUrl}" target="_blank" style="
            display: inline-block; 
            background-color: #a0522d; 
            color: white; 
            text-decoration: none; 
            padding: 15px 35px; 
            border-radius: 30px; 
            font-weight: bold; 
            box-shadow: 0 4px 8px rgba(160, 82, 45, 0.3);
            transition: background-color 0.3s ease;
          "
          onmouseover="this.style.backgroundColor='#8b3e11'" 
          onmouseout="this.style.backgroundColor='#a0522d'">
            ✅ Verify My Email Now
          </a>
          <p style="margin-top: 30px; font-size: 14px; color: #7a6a58;">
            If you didn’t sign up for Book Vault, you can safely ignore this email.
          </p>
          <hr style="margin: 30px 0; border-color: #e2d7c1;" />
          <p style="font-size: 12px; color: #a39887;">
            Book Vault &mdash; Your gateway to timeless stories<br/>
            © ${new Date().getFullYear()} Book Vault. All rights reserved.
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;
