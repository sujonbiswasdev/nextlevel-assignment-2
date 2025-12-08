import { JwtPayload } from "jsonwebtoken";
// global type declear for example req.users
declare global {
  namespace Express {
    interface Request {
      users?: JwtPayload;
    }
  }
}