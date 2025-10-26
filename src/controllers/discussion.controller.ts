import { Request, Response } from "express";
import { getDb } from "../utils/database";
import response from "../utils/response";
import {
  createDiscussionSchema,
  createReplySchema,
} from "../models/discussion.model";
import { Timestamp } from "firebase-admin/firestore";

const db = getDb();
const discussionsCollection = db.collection("discussions");

export default {
  async createDiscussion(req: Request, res: Response) {
    try {
      const validatedData = await createDiscussionSchema.validate(req.body);

      const newDiscussion = {
        ...validatedData,
        createdAt: Timestamp.now(),
      };

      const docRef = await discussionsCollection.add(newDiscussion);

      return response.success(
        res,
        { id: docRef.id, ...newDiscussion },
        "Discussion created"
      );
    } catch (error) {
      return response.error(res, error, "Error creating discussion");
    }
  },

  async getAllDiscussions(req: Request, res: Response) {
    try {
      const snapshot = await discussionsCollection
        .orderBy("createdAt", "desc")
        .get();
      const discussions: any[] = [];
      snapshot.forEach((doc) => {
        discussions.push({ id: doc.id, ...doc.data() });
      });

      return response.success(res, discussions, "Discussions retrieved");
    } catch (error) {
      return response.error(res, error, "Error getting discussions");
    }
  },

  async getDiscussionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doc = await discussionsCollection.doc(id).get();

      if (!doc.exists) {
        return response.notFound(res, "Discussion not found");
      }

      return response.success(
        res,
        { id: doc.id, ...doc.data() },
        "Discussion retrieved"
      );
    } catch (error) {
      return response.error(res, error, "Error getting discussion");
    }
  },

  async createReply(req: Request, res: Response) {
    try {
      const { discussionId } = req.params;
      const validatedData = await createReplySchema.validate(req.body);

      const discussionDoc = await discussionsCollection.doc(discussionId).get();
      if (!discussionDoc.exists) {
        return response.notFound(res, "Discussion not found");
      }

      const newReply = {
        ...validatedData,
        createdAt: Timestamp.now(),
      };

      const replyRef = await discussionsCollection
        .doc(discussionId)
        .collection("replies")
        .add(newReply);

      return response.success(
        res,
        { id: replyRef.id, ...newReply },
        "Reply added"
      );
    } catch (error) {
      return response.error(res, error, "Error adding reply");
    }
  },

  async getRepliesForDiscussion(req: Request, res: Response) {
    try {
      const { discussionId } = req.params;

      const snapshot = await discussionsCollection
        .doc(discussionId)
        .collection("replies")
        .orderBy("createdAt", "asc")
        .get();

      const replies: any[] = [];
      snapshot.forEach((doc) => {
        replies.push({ id: doc.id, ...doc.data() });
      });

      return response.success(res, replies, "Replies retrieved");
    } catch (error) {
      return response.error(res, error, "Error getting replies");
    }
  },
};
