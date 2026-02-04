import { ValidationError } from "../errors/index.js";
import type { Request, Response, NextFunction } from "express";

const suspiciousPatterns = [
  /<[\s\S]*?>/g,
  /\.\./g,
  /\/\*\*/g,
  /\$\{/g,
  /<script/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
];

export function validateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const checkSuspicious = (str: unknown): boolean => {
    if (typeof str !== "string") return true;
    return !suspiciousPatterns.some((pattern) => pattern.test(str));
  };

  for (const [key, value] of Object.entries(req.query)) {
    if (!checkSuspicious(key) || !checkSuspicious(value)) {
      next(new ValidationError("Invalid request parameters"));
      return;
    }
  }

  for (const [key, value] of Object.entries(req.params)) {
    if (!checkSuspicious(key) || !checkSuspicious(value)) {
      next(new ValidationError("Invalid request parameters"));
      return;
    }
  }

  next();
}

export function sanitizeString(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.replace(/[<>]/g, "").trim();
}

export function validateId(id: string | string[]): id is string {
  if (Array.isArray(id)) return false;
  return /^\d+$/.test(id) && parseInt(id) > 0 && parseInt(id) < 100000000;
}

export function validateContentType(type: string | string[]): type is string {
  if (Array.isArray(type)) return false;
  return ["movie", "tv"].includes(type);
}

export function validatePage(page: string | number): boolean {
  const p = typeof page === "string" ? parseInt(page) : page;
  return !isNaN(p) && p > 0 && p <= 500;
}

export function validateProvider(
  provider: string | string[]
): provider is string {
  if (Array.isArray(provider)) return false;
  const validProviders = [
    "vidplus",
    "vidsrc-pk",
    "vidsrc-icu",
    "vidlink",
    "embed-su",
    "vidsrc-ru",
    "vidsrc-su",
    "vidsrcme-su",
    "vsrc-su",
  ];
  return validProviders.includes(provider);
}

export function validateYear(year: number): boolean {
  return year >= 1900 && year <= 2030;
}

export function validateRating(rating: number): boolean {
  return rating >= 0 && rating <= 10;
}
