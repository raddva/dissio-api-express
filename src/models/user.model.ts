import * as Yup from "yup";
import * as admin from "firebase-admin";

export interface User {
  id?: string;
  displayName: string;
  email: string;
  createdAt: admin.firestore.Timestamp;
}

export const createUserSchema = Yup.object({
  displayName: Yup.string().required("Display Name is required"),
  email: Yup.string().required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = Yup.object({
  displayName: Yup.string().optional(),
  email: Yup.string().optional(),
});
