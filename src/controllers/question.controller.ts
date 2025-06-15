import { NextFunction, Request, Response } from "express";
import { Contest } from "../models/constest.model";
import { Question } from "../models/question.model";
import ErrorHandler from "../utils/ErrorHandler";

// ✅ Create a question
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contestId, type, questionText, options, correctAnswers } = req.body;

    // Basic validation
    if (!contestId || !type || !questionText || !correctAnswers) {
      next(new ErrorHandler("Missing required fields", 400));
    }

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      next(new ErrorHandler("Contest not found", 404));
    }

    const question = new Question({
      contestId,
      type,
      questionText,
      options,
      correctAnswers,
    });
    await question.save();

    res.success(question, "Question created", 201);
  } catch (err: any) {
    console.error("Error creating question:", err);
    next(new ErrorHandler(err || "something went wrong", 500));
  }
};

// ✅ Get all questions for a contest
export const getQuestionsByContest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contestId } = req.params;

    const questions = await Question.find({ contestId });

    res.success(
      { count: questions.length, questions },
      "get contest questions",
      200
    );
  } catch (err: any) {
    console.error("Error fetching questions:", err);
    next(new ErrorHandler(err || "Something went wrong", 500));
  }
};
