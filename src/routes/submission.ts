import express from "express";
import {
  getLeaderboard,
  startSubmission,
  submitAnswers,
} from "../controllers/submission.controller";
import { auth, authorize } from "../middleware/auth";

const SubmissionRouter = express.Router();

SubmissionRouter.post(
  "/submit",
  auth,
  authorize("vip", "normal"),
  submitAnswers
);
SubmissionRouter.post(
  "/contests/:contestId/start",
  auth,
  authorize("vip", "normal"),
  startSubmission
);
SubmissionRouter.get("/leaderboard", auth, authorize("admin"), getLeaderboard);

export default SubmissionRouter;
