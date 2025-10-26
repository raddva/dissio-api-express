import * as Yup from "yup";
import * as admin from "firebase-admin";

export interface Discussion {
  id?: string;
  content: string;
  authorId: string;
  createdAt: admin.firestore.Timestamp;
}

export interface Reply {
  id?: string;
  content: string;
  authorId: string;
  createdAt: admin.firestore.Timestamp;
}

export const createDiscussionSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
  authorId: Yup.string().required("Author ID is required"),
});

export const createReplySchema = Yup.object({
  content: Yup.string().required("Content is required"),
  authorId: Yup.string().required("Author ID is required"),
});
