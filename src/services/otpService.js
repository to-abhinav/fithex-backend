const nodemailer = require("nodemailer");

//six digit otp
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};




const sendOtpEmail = async (toEmail, otp) => {
  console.log("──── [OTP-EMAIL] START ────");
  console.log("[OTP-EMAIL] Recipient:", toEmail);
  console.log("[OTP-EMAIL] EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "(not set, defaulting to gmail)");
  console.log("[OTP-EMAIL] EMAIL_USER:", process.env.EMAIL_USER || "(NOT SET!)");
  console.log("[OTP-EMAIL] EMAIL_PASS set:", !!process.env.EMAIL_PASS, "| length:", (process.env.EMAIL_PASS || "").length);

  const transporter = createTransporter();

  try {
    console.log("[OTP-EMAIL] Verifying transporter connection...");
    await transporter.verify();
    console.log("[OTP-EMAIL] ✅ Transporter verified — SMTP connection OK");
  } catch (verifyErr) {
    console.error("[OTP-EMAIL] ❌ Transporter verification FAILED:");
    console.error("[OTP-EMAIL] Error name:", verifyErr.name);
    console.error("[OTP-EMAIL] Error message:", verifyErr.message);
    console.error("[OTP-EMAIL] Error code:", verifyErr.code);
    console.error("[OTP-EMAIL] Error response:", verifyErr.response);
    console.error("[OTP-EMAIL] Full error:", verifyErr);
    throw verifyErr; // re-throw so caller knows it failed
  }

 const mailOptions = {
  from: `"FitHex" <${process.env.EMAIL_USER}>`,
  to: toEmail,
  subject: "Your FitHex Registration OTP",
  html: `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: auto; background-color: #060608; border-radius: 24px; overflow: hidden; border: 1px solid #1a1a2e;">

      <!-- Header -->
      <div style="position: relative; padding: 40px 32px 28px; text-align: center; background: linear-gradient(160deg, #0d0d1a 0%, #0a0a14 100%);">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 10px; vertical-align: middle;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1"/>
                      <path d="M15 14a5 5 0 0 0-7.584 2"/>
                      <path d="M9.964 6.825C8.019 7.977 9.5 13 8 15"/>
                    </svg>
                  </td>
                  <td style="vertical-align: middle; font-size: 26px; font-weight: 700; color: #c4b5fd; letter-spacing: -0.5px;">FitHex</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Hex divider -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 45%;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #4c1d95);"></div>
            </td>
            <td align="center" style="width: 10%; padding: 0 8px;">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><polygon points="6,0 12,3.5 12,10.5 6,14 0,10.5 0,3.5" fill="#6d28d9"/></svg>
            </td>
            <td style="width: 45%;">
              <div style="height: 1px; background: linear-gradient(to left, transparent, #4c1d95);"></div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding: 36px 32px; text-align: center; background-color: #060608;">

        <p style="font-size: 11px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; color: #7c3aed; margin: 0 0 12px; font-family: Georgia, serif;">Verification Required</p>
        <h1 style="font-size: 26px; font-weight: 700; color: #f5f3ff; margin: 0 0 16px; letter-spacing: -0.5px; font-family: Georgia, serif;">Confirm your identity</h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.7; margin: 0 0 36px; font-family: Arial, sans-serif;">
          Enter this code to complete your FitHex registration.<br>
          Valid for <span style="color: #a78bfa; font-weight: 600;">5 minutes</span> — don't share it with anyone.
        </p>

        <!-- OTP Box -->
        <div style="margin-bottom: 36px;">
          <div style="display: inline-block; background: #0d0d1a; border-radius: 18px; padding: 28px 40px; border: 1px solid #2e1065; box-shadow: 0 0 0 3px #1e1040, 0 0 32px rgba(109, 40, 217, 0.35);">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #f5f3ff;">
              ${otp}
            </span>
          </div>
        </div>

        <!-- Timer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 6px; vertical-align: middle;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  </td>
                  <td style="font-size: 12px; color: #52525b; font-family: Arial, sans-serif; letter-spacing: 0.5px; vertical-align: middle;">Expires in 5 minutes</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div style="background: #0d0a1a; border: 1px solid #1e1b2e; border-left: 3px solid #6d28d9; border-radius: 10px; padding: 14px 18px; text-align: left;">
          <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.6; font-family: Arial, sans-serif;">
            <span style="color: #a78bfa; font-weight: 600;">Didn't request this?</span>
            You can safely ignore this email — your account is secure.
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid #111128; padding: 20px 32px; text-align: center; background-color: #04040a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 6px;">
              <svg width="10" height="12" viewBox="0 0 12 14" fill="none"><polygon points="6,0 12,3.5 12,10.5 6,14 0,10.5 0,3.5" fill="#3b0764"/></svg>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="font-size: 11px; color: #27272a; font-family: Arial, sans-serif; margin: 0;">© ${new Date().getFullYear()} FitHex. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </div>

    </div>
  `,
};
  console.log("[OTP-EMAIL] Sending mail to:", toEmail);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[OTP-EMAIL] ✅ Mail sent successfully!");
    console.log("[OTP-EMAIL] Response:", info.response);
    console.log("[OTP-EMAIL] MessageId:", info.messageId);
    console.log("──── [OTP-EMAIL] END ────");
  } catch (sendErr) {
    console.error("[OTP-EMAIL] ❌ sendMail FAILED:");
    console.error("[OTP-EMAIL] Error name:", sendErr.name);
    console.error("[OTP-EMAIL] Error message:", sendErr.message);
    console.error("[OTP-EMAIL] Error code:", sendErr.code);
    console.error("[OTP-EMAIL] Error command:", sendErr.command);
    console.error("[OTP-EMAIL] Error response:", sendErr.response);
    console.error("[OTP-EMAIL] Error responseCode:", sendErr.responseCode);
    console.error("[OTP-EMAIL] Full error:", sendErr);
    console.log("──── [OTP-EMAIL] END (FAILED) ────");
    throw sendErr;
  }
};

module.exports = { generateOtp, sendOtpEmail };
