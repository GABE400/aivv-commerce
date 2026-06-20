import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
      },
      tosAccepted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      privacyPolicyAccepted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, ctx) => {
        console.log(`[AUTH] Magic Link requested for ${email}`);
        
        // Log to console in development for easier local testing
        if (process.env.NODE_ENV === "development") {
          console.log(`Click this link to sign in: ${url}`);
        }

        try {
          if (process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.example.com") {
            await transporter.sendMail({
              from: process.env.EMAIL_FROM || '"Aivv" <no-reply@aivv.app>',
              to: email,
              subject: "Sign in to Aivv",
              text: `Sign in to your account by clicking this link: ${url}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                  <h2 style="color: #111827; margin-bottom: 16px;">Sign in to Aivv</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Click the button below to sign in to your Aivv account. This link will expire in 10 minutes.</p>
                  <div style="margin: 32px 0;">
                    <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Sign In</a>
                  </div>
                  <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">If you didn't request this link, you can safely ignore this email.</p>
                  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                  <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">Or copy and paste this link into your browser: <br/> <a href="${url}" style="color: #3b82f6;">${url}</a></p>
                </div>
              `,
            });
          } else {
            console.warn("[AUTH] SMTP_HOST is not configured or is the default example. Skipping email dispatch (sign-in link is printed in terminal above).");
          }
        } catch (error) {
          console.error("Failed to send magic link email via nodemailer:", error);
          if (process.env.NODE_ENV !== "development") {
            throw error;
          }
        }
      },
    }),
  ],
});
