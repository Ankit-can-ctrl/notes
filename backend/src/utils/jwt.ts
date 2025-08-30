import jwt from "jsonwebtoken";

export interface JwtUser {
  id: string;
  email: string;
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

export function signJwt(user: JwtUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyJwt(token: string): JwtUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}
