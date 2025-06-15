import express from "express";
import { successHandler } from "./middleware/success";
import { errorMiddleware } from "./middleware/error";
import { connectDB } from "./services/db";
import { IUser } from "./models/user.model";
import router from "./routes";
import cors from "cors";
import { rateLimiter } from "./middleware/rate-limiter";

connectDB();
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

app.use(successHandler); //success handler
app.use(rateLimiter);
declare global {
  namespace Express {
    export interface Request {
      user: IUser;
    }
  }
}

app.use("/api", router);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
