"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendContactEmailAction(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const { name, email, subject, message } = formData;
    
    if (!name || !email || !subject || !message) {
      return { success: false, error: "Please fill out all fields." };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Aivv Contact Form" <aivv.saas@gmail.com>',
      to: "contact@techadotech.com",
      replyTo: email,
      subject: `[Contact Form] ${subject} - from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color: #7c3aed;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-line; background-color: #f3f4f6; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px; line-height: 1.5;">
            ${message}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Your message has been sent successfully." };
  } catch (error: any) {
    console.error("Nodemailer send email error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to send email. Please copy our email address contact@techadotech.com directly." 
    };
  }
}
