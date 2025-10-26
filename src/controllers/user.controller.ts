import { Request, Response } from "express";
import { getDb } from "../utils/database";
import response from "../utils/response";
import { createUserSchema, updateUserSchema } from "../models/user.model";
import { Timestamp } from "firebase-admin/firestore";

export default {
  async createUser(req: Request, res: Response) {
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const validatedData = await createUserSchema.validate(req.body);
      const { email, name } = validatedData;

      const existingUser = await usersCollection
        .where("email", "==", email)
        .get();
      if (!existingUser.empty) {
        return response.error(
          res,
          { code: "auth/already-exists" },
          "Email already in use"
        );
      }

      const newUser = {
        name,
        email,
        createdAt: Timestamp.now(),
      };
      const docRef = await usersCollection.add(newUser);

      return response.success(
        res,
        { id: docRef.id, ...newUser },
        "User created successfully"
      );
    } catch (error) {
      return response.error(res, error, "Error creating user");
    }
  },

  async getAllUsers(req: Request, res: Response) {
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const snapshot = await usersCollection.orderBy("createdAt", "desc").get();
      const users: any[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return response.success(res, users, "Users retrieved successfully");
    } catch (error) {
      return response.error(res, error, "Error getting users");
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const { id } = req.params;
      const userDoc = await usersCollection.doc(id).get();

      if (!userDoc.exists) {
        return response.notFound(res, "User not found");
      }

      return response.success(
        res,
        { id: userDoc.id, ...userDoc.data() },
        "User retrieved successfully"
      );
    } catch (error) {
      return response.error(res, error, "Error getting user");
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const { id } = req.params;
      const validatedData = await updateUserSchema.validate(req.body);

      const userRef = usersCollection.doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return response.notFound(res, "User not found");
      }

      await userRef.update(validatedData);

      return response.success(
        res,
        { id: id, ...validatedData },
        "User updated successfully"
      );
    } catch (error) {
      return response.error(res, error, "Error updating user");
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const { id } = req.params;

      const userRef = usersCollection.doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return response.notFound(res, "User not found");
      }

      await userRef.delete();

      return response.success(res, null, "User deleted successfully");
    } catch (error) {
      return response.error(res, error, "Error deleting user");
    }
  },
};
