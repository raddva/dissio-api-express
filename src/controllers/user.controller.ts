import { Request, Response } from "express";
import { getDb } from "../utils/database";
import response from "../utils/response";
import { createUserSchema, updateUserSchema } from "../models/user.model";
import { Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    displayName: string;
    password: string;
  };
}

export default {
  async registerUser(req: Request, res: Response) {
    /**
     * #swagger.tags = ['Auth']
     * #swagger.summary = 'Register a new user'
     * #swagger.requestBody = {
     * required: true,
     * schema: {
     * $ref: "#/components/schemas/CreateUserRequest"
     * }
     * }
     */
    try {
      const validatedData = await createUserSchema.validate(req.body);
      const { email, displayName, password } = validatedData;

      const db = getDb();
      const usersCollection = db.collection("users");

      const existingUser = await usersCollection
        .where("email", "==", email)
        .get();
      if (!existingUser.empty) {
        return response.error(
          res,
          { code: "auth/already-exists" },
          "email already in use"
        );
      }

      const userRecord = await getAuth().createUser({
        email: email,
        password: password,
        displayName: displayName,
      });

      const newUser = {
        displayName,
        email,
        createdAt: Timestamp.now(),
      };

      await usersCollection.doc(userRecord.uid).set(newUser);
      return response.success(
        res,
        { id: userRecord.uid, ...newUser },
        "User created successfully"
      );
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        return response.error(res, error, "email already exists in Firebase");
      }
      return response.error(res, error, "Error creating user");
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    /**
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Gets the profile for the authenticated user'
     * #swagger.security = [{ "bearerAuth": {} }]
     */
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return response.unauthorized(res, "No user ID found in token.");
      }

      const db = getDb();
      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        return response.notFound(res, "User profile not found");
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

  async getAllUsers(req: Request, res: Response) {
    /**
     * #swagger.tags = ['Users']
     */
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

  async updateUser(req: AuthRequest, res: Response) {
    /**
     * #swagger.tags = ['Users']
     * #swagger.security = [{
     * "bearerAuth": {}
     * }]
     * #swagger.requestBody = { ... }
     */
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const { id } = req.params;

      if (id !== req.user?.uid) {
        return response.unauthorized(
          res,
          "You can only update your own profile."
        );
      }

      const validatedData = await updateUserSchema.validate(req.body);

      const userRef = usersCollection.doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return response.notFound(res, "User not found");
      }

      await userRef.update(validatedData);

      if (validatedData.displayName) {
        await getAuth().updateUser(id, {
          displayName: validatedData.displayName,
        });
      }

      return response.success(
        res,
        { id: id, ...validatedData },
        "User updated successfully"
      );
    } catch (error) {
      return response.error(res, error, "Error updating user");
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    /**
     * #swagger.tags = ['Users']
     * #swagger.security = [{
     * "bearerAuth": {}
     * }]
     */
    try {
      const db = getDb();
      const usersCollection = db.collection("users");
      const { id } = req.params;

      if (id !== req.user?.uid) {
        return response.unauthorized(
          res,
          "You can only delete your own account."
        );
      }

      const userRef = usersCollection.doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return response.notFound(res, "User profile not found");
      }

      await getAuth().deleteUser(id);
      await userRef.delete();

      return response.success(res, null, "User deleted successfully");
    } catch (error) {
      return response.error(res, error, "Error deleting user");
    }
  },
};
