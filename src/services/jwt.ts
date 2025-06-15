import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/env_variables";

/** ----------------------------------------------------------------
 *  Adjust in `.env` (recommended) or fall back to safe defaults.
 *  ---------------------------------------------------------------- */

/** Shape of what you encode in the JWT */
export interface JwtPayload {
  _id: string;
  email: string;
  role: string;
}

/** Sign – create a token */
export const signToken = (payload: JwtPayload) => jwt.sign(payload, JWT_SECRET);

/** Verify – decode & validate */
export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;
