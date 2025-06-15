import express from "express";
import { auth, authorize } from "../middleware/auth";
import {
  createQuestion,
  getQuestionsByContest,
} from "../controllers/question.controller";

const questionRoute = express.Router();

questionRoute.post("/", auth, authorize("admin"), createQuestion);
questionRoute.get(
  "/:contestId",
  auth,
  authorize("admin", "normal", "vip"),
  getQuestionsByContest
);

export default questionRoute;
