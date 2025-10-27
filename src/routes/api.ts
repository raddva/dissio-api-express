import { Router } from "express";
import userController from "../controllers/user.controller";
import discussionController from "../controllers/discussion.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();
// --- Auth Routes (Public) ---
router.post("/auth/register", userController.registerUser);
// --- User Routes (Protected) ---
router.get("/users/me", authMiddleware.verifyToken, userController.getMe);
router.get("/users/:id", userController.getUserById);

router.put("/users/:id", authMiddleware.verifyToken, userController.updateUser);
router.delete(
  "/users/:id",
  authMiddleware.verifyToken,
  userController.deleteUser
);

// --- Discussion Routes ---
router.post("/discussions", discussionController.createDiscussion);
router.get("/discussions", discussionController.getAllDiscussions);
router.get("/discussions/:id", discussionController.getDiscussionById);

// --- Reply Routes ---
router.post(
  "/discussions/:discussionId/replies",
  discussionController.createReply
);
router.get(
  "/discussions/:discussionId/replies",
  discussionController.getRepliesForDiscussion
);

export default router;
