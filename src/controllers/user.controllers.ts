import { Request, Response, NextFunction } from "express";
import { IUser, User } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { signToken } from "../services/jwt";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new ErrorHandler("Email alreadly in use", 400));

    const user = new User({ username, email, password, role });
    await user.save();
    const token = signToken({
      _id: user?._id?.toString()!,
      email: user.email,
      role: user.role,
    });
    const { password: _, ...safeUser } = user.toObject();
    res.success({ user: safeUser, token }, "user created", 201);
  } catch (err: any) {
    next(new ErrorHandler(err || "something went wrong", 500));
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = (await User.findOne({ email })) as IUser | null;

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    const token = signToken({
      _id: user?._id?.toString()!,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...safeUser } = user.toObject();

    res.success({ user: safeUser, token }, "user logged in", 200);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.json({
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
