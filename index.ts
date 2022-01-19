import express, { Application, Request, Response } from "express";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import * as dotenv from "dotenv";
dotenv.config();

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hostname = process.env.SMTP_HOSTNAME;
const username = process.env.SMTP_USERNAME;
const password = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: hostname,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: username,
    pass: password,
  },
  logger: true,
});

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

app.post("/hi", async (req: Request, res: Response): Promise<Response> => {
  let { email, message } = req.body;

  const messageData = {
    from: "Jason <jason@ribble.biz>",
    to: "jasonribble@protonmail.com",
    subject: `${email} sent you a message`,
    text: `${message}\n${email}`,
  };

  try {
    const info = await transporter.sendMail(messageData);
    console.log("Message sent: %s", info.response);
    return res.status(200).send({ message: "Ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
});

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occurred: ${error}`);
}
