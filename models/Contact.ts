import mongoose, { Schema } from "mongoose";

// Document interface
interface Contact {
  email: string;
  message: string;
}

// Schema
const ContactSchema = new Schema<Contact>({
  email: { type: String, required: true },
  message: { type: String, required: true },
});

export default mongoose.model<Contact>("Contact", ContactSchema);
