import { Schema, model, Types, Document } from "mongoose";

type Status = "not-started" | "in-progress" | "submitted";
interface ISubmission extends Document {
  userId: Types.ObjectId;
  contestId: Types.ObjectId;
  answers: {
    questionId: Types.ObjectId;
    selectedAnswers: string[];
  }[];
  score: number;
  status: Status;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswers: [{ type: String }],
      },
    ],
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "submitted"],
      default: "not-started",
    },
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, contestId: 1 }, { unique: true });

export const Submission = model<ISubmission>("Submission", SubmissionSchema);
