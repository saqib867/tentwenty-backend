import ContestRouter from "./contest";
import leaderboardRoute from "./leaderboard.route";
import questionRoute from "./question.route";
import SubmissionRouter from "./submission";
import UserRouter from "./user.route";
import express from "express";

const router = express.Router();

router.use("/user", UserRouter);

router.use("/contests", ContestRouter);

router.use("/question", questionRoute);
router.use("/leaderboard", leaderboardRoute);
router.use("/submission", SubmissionRouter);

export default router;
