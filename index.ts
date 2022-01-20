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

app.post("/contact", async (req: Request, res: Response): Promise<void> => {
  let { email, message } = req.body;

  await connect(process.env.DB_HOST || "mongodb://localhost:27017/example");

  const contact = new Contact({
    email,
    message,
  });

  await contact.save();

  console.log("Saved contact to database: " + contact.id);

  res.sendStatus(200);
});

app.post("/mail", async (req: Request, res: Response): Promise<Response> => {
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

// Server start up
try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occurred: ${error}`);
}
