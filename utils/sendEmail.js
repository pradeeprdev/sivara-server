import nodemailer from "nodemailer";
export const sendEmail = async(to,subject,text)=>{
    const transporter = nodemailer.createTransport(
      {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "015e22f5f54dc8",
          pass: "57a4b00cf77b23"
        }
      }
    );

    await transporter.sendMail({
        to,subject,text,
    });
};
export default sendEmail;