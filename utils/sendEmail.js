import nodemailer from "nodemailer";
import { config } from "dotenv";
config({
  path:'./.env',
});
export const sendEmail = async(to,subject,text)=>{
    const transporter = nodemailer.createTransport(
      {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        }
      }
    );

    await transporter.sendMail({
        to,subject,text,
    });
};
export default sendEmail;