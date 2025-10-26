import { Response } from "express";
import * as Yup from "yup";

type Pagination = {
  totalPages: number;
  current: number;
  total: number;
};

interface FirebaseError {
  code: string;
  message: string;
}

const isFirebaseError = (error: unknown): error is FirebaseError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
};

export default {
  success(res: Response, data: any, message: string) {
    res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
    });
  },

  error(res: Response, error: unknown, message: string) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        meta: {
          status: 400,
          message: message || "Validation failed",
        },
        data: { [`${error.path}`]: error.errors[0] },
      });
    }

    if (isFirebaseError(error)) {
      let statusCode = 500;
      const errorMessage = message || error.message;

      switch (error.code) {
        case "auth/user-not-found":
        case "firestore/not-found":
          statusCode = 404;
          break;
        case "auth/id-token-expired":
        case "auth/invalid-id-token":
          statusCode = 401;
          break;
        case "auth/invalid-credential":
          statusCode = 400;
          break;
        case "auth/permission-denied":
        case "firestore/permission-denied":
          statusCode = 403;
          break;
        case "auth/already-exists":
        case "firestore/already-exists":
          statusCode = 409;
          break;
        case "auth/invalid-argument":
        case "firestore/invalid-argument":
          statusCode = 400;
          break;
      }

      return res.status(statusCode).json({
        meta: {
          status: statusCode,
          message: errorMessage,
        },
        data: {
          code: error.code,
        },
      });
    }

    res.status(500).json({
      meta: {
        status: 500,
        message: message || "An unexpected server error occurred.",
      },
      data: error,
    });
  },

  unauthorized(res: Response, message: string = "Unauthorized") {
    res.status(403).json({
      meta: {
        status: 403,
        message,
      },
      data: null,
    });
  },

  notFound(res: Response, message: string = "Not Found") {
    res.status(404).json({
      meta: {
        status: 404,
        message,
      },
      data: null,
    });
  },

  pagination(
    res: Response,
    data: any[],
    pagination: Pagination,
    message: string
  ) {
    res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
      pagination,
    });
  },
};
