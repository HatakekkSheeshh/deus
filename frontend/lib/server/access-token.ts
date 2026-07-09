import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Role } from "@/lib/types";

export type ShareRole = Extract<Role, "family" | "counselor">;

const tokenPrefix: Record<ShareRole, string> = {
  family: "FAM",
  counselor: "COU"
};

export function normalizeAccessToken(token: string) {
  return token.trim().toUpperCase();
}

export function generateAccessToken(role: ShareRole) {
  return `${tokenPrefix[role]}-${randomBytes(24).toString("base64url").slice(0, 32)}`;
}

export function hashAccessToken(token: string, pepper = process.env.ACCESS_TOKEN_PEPPER ?? "") {
  return createHash("sha256")
    .update(`${pepper}:${normalizeAccessToken(token)}`)
    .digest("hex");
}

export function verifyAccessTokenHash(token: string, storedHash: string, pepper = process.env.ACCESS_TOKEN_PEPPER ?? "") {
  if (!/^[a-f0-9]{64}$/i.test(storedHash)) return false;

  const candidate = Buffer.from(hashAccessToken(token, pepper), "hex");
  const stored = Buffer.from(storedHash, "hex");

  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}
