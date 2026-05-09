import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  makeRevision,
  saveProjectCode,
  rollBackToVersion,
  deleteProject,
  getProjectPreview,
  getPublishedProjects,
  getProjectById,
} from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.post("/:projectId/revision", protect, makeRevision);
projectRouter.put("/:projectId/save", protect, saveProjectCode);
projectRouter.post("/:projectId/rollback/:versionId", protect, rollBackToVersion);
projectRouter.delete("/:projectId", protect, deleteProject);

projectRouter.get("/preview/:projectId", protect, getProjectPreview);
projectRouter.get("/published", getPublishedProjects);
projectRouter.get("/published/:projectId", getProjectById);

export default projectRouter;