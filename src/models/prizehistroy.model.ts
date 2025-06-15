import { Schema, model, Types, Document } from "mongoose";

interface IPrizeHistory extends Document {
  userId: Types.ObjectId;
  contestId: Types.ObjectId;
  prize: string;
  dateAwarded: Date;
}

const PrizeHistorySchema = new Schema<IPrizeHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
    prize: { type: String, required: true },
    dateAwarded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PrizeHistory = model<IPrizeHistory>(
  "PrizeHistory",
  PrizeHistorySchema
);
