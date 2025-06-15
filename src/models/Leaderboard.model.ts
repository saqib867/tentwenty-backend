import { Schema, model, Types, Document } from "mongoose";
interface ILeaderboard extends Document {
  contestId: Types.ObjectId;
  userId: Types.ObjectId;
  score: number;
  rank: number;
}

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Leaderboard = model<ILeaderboard>(
  "Leaderboard",
  LeaderboardSchema
);
