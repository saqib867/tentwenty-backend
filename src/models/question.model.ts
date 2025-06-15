import { Schema, model, Types, Document } from "mongoose";
type QuestionType = "single-select" | "multi-select" | "true-false";

interface IQuestion extends Document {
  contestId: Types.ObjectId;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswers: string[]; // supports multi/single
}

const QuestionSchema = new Schema<IQuestion>(
  {
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true },
    type: {
      type: String,
      enum: ["single-select", "multi-select", "true-false"],
      required: true,
    },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswers: [{ type: String }],
  },
  { timestamps: true }
);

export const Question = model<IQuestion>("Question", QuestionSchema);
