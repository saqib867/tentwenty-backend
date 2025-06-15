import { Schema, model, Types, Document } from "mongoose";

type AccessLevel = "vip" | "normal";
type Status = "ongoing" | "completed";

interface IContest extends Document {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  accessLevel: AccessLevel;
  status: Status;
  prize: string;
}

const ContestSchema = new Schema<IContest>(
  {
    name: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    accessLevel: {
      type: String,
      enum: ["vip", "normal"],
      required: true,
    },
    prize: { type: String, required: true },
  },
  { timestamps: true }
);

export const Contest = model<IContest>("Contest", ContestSchema);
