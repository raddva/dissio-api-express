// Create a new file: src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import response from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        displayName: string;
        password: string;
      };
    }
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.unauthorized(res, "No token provided or invalid format");
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return response.unauthorized(res, "Invalid or expired token");
  }
};

export default { verifyToken };
