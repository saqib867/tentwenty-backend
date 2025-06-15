import express from "express";
import { getLeaderboardByContest } from "../controllers/leaderboard";

const leaderboardRoute = express.Router();

leaderboardRoute.get("/", getLeaderboardByContest);

export default leaderboardRoute;
