import { NextFunction, Request, Response } from "express";
import { Leaderboard } from "../models/Leaderboard.model";
import ErrorHandler from "../utils/ErrorHandler";

export const getLeaderboardByContest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contestId } = req.params;

    const leaderboard = await Leaderboard.find({ contestId })
      .populate("userId", "username email role")
      .sort({ score: -1 })
      .limit(100);

    res.success(
      { count: leaderboard.length, leaderboard },
      "get leader board data",
      200
    );
  } catch (err: any) {
    console.error("Error fetching leaderboard:", err);
    next(new ErrorHandler(err || "Something went wrong", 500));
  }
};

export const updateUserScore = async (
  userId: string,
  contestId: string,
  score: number
) => {
  const existing = await Leaderboard.findOne({ userId, contestId });

  if (existing) {
    existing.score = score;
    await existing.save();
    return existing;
  } else {
    const newEntry = new Leaderboard({ userId, contestId, score });
    await newEntry.save();
    return newEntry;
  }
};
