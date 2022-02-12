import express, { Application, Request, Response } from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import * as dotenv from "dotenv";
import { connect } from "mongoose";
import Contact from "./models/Contact";
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hostname = process.env.SMTP_HOSTNAME;
const username = process.env.SMTP_USERNAME;
const password = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: hostname,
  port: 465,
  secure: true,
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

app.get("/.well-known/acme-challenge/:content", function (req, res) {
  res.send(
    "0akukSfvdv9ySbVXN2bZQ2mrOKM--WQUrhvABO2KZxY.axcpo901pqu12k4-tw60OYIIE6rPevVt5ey91VsuQU4"
  );
});

app.post("/contact", async (req: Request, res: Response): Promise<void> => {
  let { email, message } = req.body;

  await connect(process.env.DB_HOST || "mongodb://localhost:27017/example");

  const contact = new Contact({
    email,
    message,
  });

  await contact.save();

  console.log("Saved contact to database: " + contact.id);

  // Email
  const messageData = {
    from: `Jason <${process.env.MY_EMAIL}>`,
    to: process.env.TO_EMAIL,
    subject: `${email} sent you a message`,
    text: `${message}\n${email}`,
  };

  try {
    const info = await transporter.sendMail(messageData);
    console.log("Message sent: %s", info.response);
  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

// Server start up
try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occurred: ${error}`);
}
