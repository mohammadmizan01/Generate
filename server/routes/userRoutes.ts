import express from "express";
import {
  createUserProject,
  getUserCredits,
  getUserProject,
  getUserProjects,
  togglePublish,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/credits", protect, getUserCredits);
userRouter.post("/projects", protect, createUserProject);
userRouter.get("/projects", protect, getUserProjects);
userRouter.get("/projects/:projectId", protect, getUserProject);
userRouter.patch("/projects/:projectId/publish", protect, togglePublish);

export default userRouter;