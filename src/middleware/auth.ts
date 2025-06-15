import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler";
import { UserRole } from "../models/user.model";
import { JWT_SECRET } from "../config/env_variables";
//import { jwt_secret } from "../config/env_config";

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res
      .status(401)
      .json({ success: false, message: "Authorization header not found" });
    return;
  }

  const token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token not found in Authorization header",
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user: any) => {
    if (err) {
      res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }
    console.log("user => ", user);
    req.user = user; // Attach the decoded user information to the request object
    next(); // Pass control to the next middleware function
  });
};

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ErrorHandler("Access denied, Insufficient role", 403));
    }

    next();
  };
