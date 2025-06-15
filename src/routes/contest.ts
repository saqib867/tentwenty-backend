import express from "express";
import { auth, authorize } from "../middleware/auth";
import {
  createContest,
  getContestById,
  getContests,
  getContestsHome,
  getInProgressContests,
  getParticipatedContests,
  getWonContests,
} from "../controllers/contest.controller";

const ContestRouter = express.Router();

ContestRouter.post("/", auth, authorize("admin"), createContest);
ContestRouter.get("/", auth, authorize("admin", "vip", "normal"), getContests);
ContestRouter.get("/home", getContestsHome);

//let me clear this route, this route is for all contest that the user has participated and completed
ContestRouter.get(
  "/participated",
  auth,
  authorize("vip", "normal"),
  getParticipatedContests
);
ContestRouter.get(
  "/in-progress",
  auth,
  authorize("vip", "normal"),
  getInProgressContests
);
ContestRouter.get("/won", auth, authorize("vip", "normal"), getWonContests);
ContestRouter.get("/:id", auth, authorize("vip", "normal"), getContestById);

export default ContestRouter;
