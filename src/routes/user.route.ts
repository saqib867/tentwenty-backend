import express from "express";
import { auth } from "../middleware/auth";
import { createUser, loginUser } from "../controllers/user.controllers";

const UserRouter = express.Router();

UserRouter.post("/signup", createUser);
UserRouter.post("/login", loginUser);

export default UserRouter;
