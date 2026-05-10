import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const MAX_PROMPT_LENGTH = 4000;
const MAX_PROJECT_NAME_LENGTH = 50;
const CREDIT_COST = 5;

type CreateProjectBody = {
  initial_prompt?: unknown;
};

type ProjectParams = {
  projectId: string;
};

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) return null;

  return trimmed;
}

function buildProjectName(prompt: string): string {
  if (prompt.length <= MAX_PROJECT_NAME_LENGTH) return prompt;
  return `${prompt.slice(0, MAX_PROJECT_NAME_LENGTH - 3)}...`;
}

export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ credits: user.credits });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const createUserProject = async (
  req: Request<{}, {}, CreateProjectBody>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const initialPrompt = normalizeText(req.body?.initial_prompt, MAX_PROMPT_LENGTH);

    if (!initialPrompt) {
      return res.status(400).json({
        message: "initial_prompt must be a non-empty string within the allowed length",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits < CREDIT_COST) {
      return res.status(403).json({ message: "Add credits" });
    }

    const project = await prisma.websiteProject.create({
      data: {
        name: buildProjectName(initialPrompt),
        initial_prompt: initialPrompt,
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalCreation: {
          increment: 1,
        },
      },
    });

    return res.status(201).json({
      projectId: project.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const getUserProject = async (
  req: Request<ProjectParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, 100);

    if (!projectId) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        conversation: {
          orderBy: { timestamp: "asc" },
        },
        versions: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ project });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.websiteProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ projects });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const togglePublish = async (
  req: Request<ProjectParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, 100);

    if (!projectId) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const nextState = !project.isPublished;

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { isPublished: nextState },
    });

    return res.json({
      message: nextState ? "Project published" : "Project unpublished",
      isPublished: nextState,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};