import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";


const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err?.statusCode || 500;
  err.message = err?.message || "internal server error";
  if (err.name == "CastError") {
    const message = `Resource not found, invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  if (err.code == "11000") {
    const message = "Duplicate id found";
    err = new ErrorHandler(message, 400);
  }
  if (err.name == "jsonWebTokenError") {
    const message = "Your token is expired, please try again";
    err = new ErrorHandler(message, 400);
  }
  res.status(err?.statusCode).json({ success: false, message: err?.message });
};

export { errorMiddleware };
