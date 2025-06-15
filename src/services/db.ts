import mongoose from "mongoose";
import { MONGO_URI } from "../config/env_variables";
import { agenda } from "./agends";
//VCFWrnBkM1MVyTNx
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" MongoDB connected");
    agenda.start();
  } catch (err) {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  }
};
