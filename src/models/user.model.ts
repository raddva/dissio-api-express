import * as Yup from "yup";
import * as admin from "firebase-admin";

export interface User {
  id?: string;
  name: string;
  email: string;
  createdAt: admin.firestore.Timestamp;
}

export const createUserSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Must be a valid email")
    .required("Email is required"),
});

export const updateUserSchema = Yup.object({
  name: Yup.string().optional(),
  email: Yup.string().email("Must be a valid email").optional(),
});
