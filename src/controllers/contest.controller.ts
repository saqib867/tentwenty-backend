import { NextFunction, Request, Response } from "express";
import { Contest } from "../models/constest.model";
import { UserRole } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { Submission } from "../models/submission.model";
import { agenda } from "../services/agends";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const createContest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, accessLevel, startTime, endTime, prize } =
      req.body;

    if (!name || !accessLevel || !startTime || !endTime || !prize) {
      return next(new ErrorHandler("Please provide all the fields", 400));
    }

    const contest = new Contest({
      name,
      description,
      accessLevel,
      startTime,
      endTime,
      prize,
    });

    await contest.save();
    await agenda.schedule(contest.endTime, "close-contest", {
      contestId: contest._id,
    });
    res.success(contest, "contest created", 201);
  } catch (err: any) {
    console.error("Error creating contest:", err);
    next(new ErrorHandler(err || "Something went wrong", 500));
  }
};

export const getContests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    let contests;
    if (user.role === "admin") {
      contests = await Contest.find({ status: "ongoing" }).limit(20).lean();
    } else if (user.role === "vip") {
      contests = await Contest.find({ accessLevel: "vip", status: "ongoing" })
        .limit(20)
        .lean();
    } else if (user.role === "normal") {
      contests = await Contest.find({
        accessLevel: "normal",
        status: "ongoing",
      })
        .limit(20)
        .lean();
    } else {
      // Guest can view contests but not participate
      contests = await Contest.find({ accessLevel: "normal" }).limit(20).lean();
    }

    const submissions = await Submission.find({
      userId: user._id as any,
      contestId: { $in: contests.map((c) => c._id) },
      status: "submitted",
    }).select("contestId"); // only need contestId

    const participatedIds = new Set(
      submissions.map((s) => s.contestId.toString())
    );

    // Step 3: Annotate each contest with hasParticipated
    const contestsWithParticipation = contests.map((contest) => ({
      ...contest,
      hasParticipated: participatedIds.has(contest._id!.toString()),
    }));

    console.log("contest with partipients => ", contestsWithParticipation);

    res.success(
      { count: contests.length, contests: contestsWithParticipation },
      "Contest get successfully",
      200
    );
  } catch (err: any) {
    console.error("Error fetching contests:", err);
    next(new ErrorHandler(err || "Something went wrong", 500));
  }
};
export const getContestsHome = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let contests;

    // Guest can view contests but not participate
    contests = await Contest.find({ status: "ongoing" });

    res.success(
      { count: contests.length, contests },
      "Contest get successfully",
      200
    );
  } catch (err: any) {
    console.error("Error fetching contests:", err);
    next(new ErrorHandler(err || "Something went wrong", 500));
  }
};

export const getContestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);

    if (!contest) {
      return next(new ErrorHandler("No contest found by the id", 404));
    }
    res.success(contest, "Single contest fetched", 200);
  } catch (err: any) {
    console.error("Error fetching contest:", err);

    next(new ErrorHandler(err || "Something went wrong", 500));
  }
};

export const getParticipatedContests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id as string;

    const submissions = await Submission.find({
      userId,
      status: "submitted",
    })
      .populate({
        path: "contestId",
        match: { status: "completed" },
      })
      .lean();

    const completedSubs = submissions.filter((s) => s.contestId);

    const contestIds = completedSubs.map((s) => s.contestId._id);

    const topScores = await Submission.aggregate([
      { $match: { contestId: { $in: contestIds }, status: "submitted" } },
      { $sort: { score: -1, createdAt: 1 } },
      {
        $group: {
          _id: "$contestId",
          topUserId: { $first: "$userId" },
        },
      },
    ]);

    const topMap = new Map(
      topScores.map((row) => [row._id.toString(), row.topUserId.toString()])
    );

    const contests = completedSubs.map((sub) => {
      const c = sub.contestId;
      return {
        ...c,
        hasWon: topMap.get(c._id.toString()) === userId,
      };
    });

    res.success({ count: contests.length, contests }, "contests fetched", 200);
  } catch (err: any) {
    next(new ErrorHandler(err.message || "Something went wrong", 500));
  }
};

export const getWonContests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id as string;

    const winners = await Submission.aggregate([
      {
        $match: {
          status: "submitted",
        },
      },

      {
        $lookup: {
          from: "contests",
          localField: "contestId",
          foreignField: "_id",
          as: "contest",
        },
      },
      { $unwind: "$contest" },

      {
        $match: {
          "contest.status": "completed",
        },
      },

      {
        $sort: { score: -1, createdAt: 1 },
      },
      {
        $group: {
          _id: "$contestId",
          topUserId: { $first: "$userId" },
          topScore: { $first: "$score" },
          contestInfo: { $first: "$contest" },
        },
      },

      {
        $match: {
          $expr: {
            $eq: ["$topUserId", new mongoose.Types.ObjectId(userId)],
          },
        },
      },

      {
        $project: {
          _id: "$contestInfo._id",
          name: "$contestInfo.name",
          prize: "$contestInfo.prize",
          accessLevel: "$contestInfo.accessLevel",
          status: "$contestInfo.status",
          winningScore: 1,
        },
      },
    ]);

    res.success(
      { count: winners.length, contests: winners },
      "get won contests (only completed)",
      200
    );
  } catch (err: any) {
    next(new ErrorHandler(err.message || "Something went wrong", 500));
  }
};

//this controlle will get all the contest that a user has joined but not answered the questions
export const getInProgressContests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;

    const submissions = await Submission.find({
      userId,
      status: "in-progress",
    })
      .populate("contestId")
      .lean();

    const contests = submissions.map((s) => s.contestId);

    res.success(
      { count: contests.length, contests },
      "in progress fetched",
      200
    );
  } catch (err) {
    next(err);
  }
};
