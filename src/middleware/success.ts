// types/express.d.ts
import "express";

declare global {
  namespace Express {
    export interface Response {
      success(data: any, message: string, statusCode: number): void;
    }
  }
}

import { NextFunction, Request, Response } from "express";

const successHandler = (req: Request, res: Response, next: NextFunction) => {
  res.success = (data: any, message: string, statusCode: number) => {
    res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  };
  next();
};

export { successHandler };
