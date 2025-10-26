import { Router } from "express";
import userController from "../controllers/user.controller";
import discussionController from "../controllers/discussion.controller";

const router = Router();

// --- User Routes ---
router.post("/users", userController.createUser);
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

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
