import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"] || "";
  const token = Array.isArray(authHeader)
    ? authHeader[0]?.split(" ")[1]
    : authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "MissingBearerToken" });
  }
  const user = verifyJwt(token);
  if (!user) {
    return res.status(401).json({ error: "InvalidOrExpiredToken" });
  }
  req.user = user;
  next();
}
