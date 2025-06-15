import { NextFunction, Request, Response } from "express";
import { Submission } from "../models/submission.model";
import ErrorHandler from "../utils/ErrorHandler";
import { Question } from "../models/question.model";
import mongoose from "mongoose";
import { Contest } from "../models/constest.model";

/**
 * GET /api/submissions/user/:userId?status=submitted|in-progress
 */

export const submitAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { contestId, answers } = req.body;
    console.log("contest id=> ", contestId);

    if (!contestId || !answers || !Array.isArray(answers)) {
      return next(new ErrorHandler("Invalid body request", 400));
    }

    // Fetch all relevant questions
    const findContest = await Question.find({ contestId: contestId });
    const questionIds = answers.map((ans: any) => ans.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    console.log("questin id => ", answers.length);
    if (answers.length < findContest.length) {
      return next(new ErrorHandler("Please answer all the questions", 400));
    }

    // Create a map for quick lookup
    const questionMap = new Map<
      string,
      { correctAnswers: string[]; type: string }
    >();
    questions.forEach((q: any) => {
      questionMap.set(q._id.toString(), {
        correctAnswers: q.correctAnswers.sort(),
        type: q.type,
      });
    });

    // Calculate score
    let score = 0;

    answers.forEach(
      (ans: { questionId: string; selectedAnswers: string[] }) => {
        const q = questionMap.get(ans.questionId);
        if (!q) return;

        const userAns = [...ans.selectedAnswers].sort();
        const correct = q.correctAnswers;

        const isCorrect =
          q.type === "multi-select"
            ? JSON.stringify(userAns) === JSON.stringify(correct)
            : correct.length === 1 &&
              userAns.length === 1 &&
              userAns[0] === correct[0];

        if (isCorrect) score += 1;
      }
    );

    // Create or update submission
    const submission = await Submission.findOneAndUpdate(
      { userId, contestId },
      {
        $set: {
          answers,
          score,
          status: "submitted",
        },
      },
      { new: true, upsert: true }
    );

    res.success(
      {
        submissionId: submission._id,
        score,
      },
      "Answer submitted successfully",
      200
    );
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const startSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { contestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return next(new ErrorHandler("Invalid contest ID", 400));
    }

    const submission = await Submission.findOneAndUpdate(
      { userId, contestId },
      {
        // $setOnInsert: { answers: [], score: 0 },
        $set: { status: "in-progress" },
      },
      { new: true, upsert: true }
    );

    res.success(submission, "Submission started / updated to in-progress", 200);
  } catch (err: any) {
    next(new ErrorHandler(err.message || "Something went wrong", 500));
  }
};

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topUsers = await Submission.aggregate([
      { $match: { status: "submitted" } },

      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
        },
      },

      { $sort: { totalScore: -1 } },

      { $limit: 100 },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalScore: 1,
        },
      },
    ]);

    res.success(
      { count: topUsers.length, leaderboard: topUsers },
      "Leaderboard fetched",
      200
    );
  } catch (err: any) {
    next(new ErrorHandler(err.message || "Something went wrong", 500));
  }
};
