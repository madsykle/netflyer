import { config } from "../config/index.js";
import { CorsError } from "../errors/index.js";
import type { Request, Response, NextFunction } from "express";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://netflyer.vercel.app",
  config.FRONTEND_URL,
].filter(Boolean);

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const origin = req.headers.origin;

  if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (
    allowedOrigins.includes(origin) ||
    config.NODE_ENV === "development"
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    next(new CorsError());
    return;
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
