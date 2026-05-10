import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai, { OPENROUTER_MODEL } from "../configs/openai.js";

const CREDIT_COST = 5;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_CODE_LENGTH = 500000;
const MAX_PROJECT_ID_LENGTH = 100;
const MAX_VERSION_ID_LENGTH = 100;

type ProjectParams = {
  projectId: string;
};

type VersionParams = {
  projectId: string;
  versionId: string;
};

type RevisionBody = {
  message?: unknown;
};

type SaveProjectBody = {
  code?: unknown;
  description?: unknown;
};

type ProjectIdParam = {
  projectId: string;
};

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) return null;

  return trimmed;
}

function stripCodeFences(content: string): string {
  return content
    .replace(/```(?:html|markdown|md|json|js|tsx|ts)?\n?/gi, "")
    .replace(/```/g, "")
    .trim();
}

function buildHtmlGenerationMessages(args: {
  currentCode: string | null;
  requestText: string;
}) {
  const { currentCode, requestText } = args;

  if (currentCode) {
    return [
      {
        role: "system" as const,
        content:
          "You are an expert web developer. Update the current website code according to the user's request. Return valid HTML only. Use Tailwind CSS for all styling. Keep the page complete and ready to render. Include interactive JavaScript before </body>. Do not include markdown, explanations, or code fences.",
      },
      {
        role: "user" as const,
        content: `Current website code:\n${currentCode}\n\nUser request:\n${requestText}`,
      },
    ];
  }

  return [
    {
      role: "system" as const,
      content:
        "You are an expert web developer. Create a complete, production-ready, single-page website from the user's request. Return valid HTML only. Use Tailwind CSS for all styling. Include interactive JavaScript before </body>. Do not include markdown, explanations, or code fences.",
    },
    {
      role: "user" as const,
      content: `User request:\n${requestText}`,
    },
  ];
}

export const makeRevision = async (
  req: Request<ProjectParams, unknown, RevisionBody>,
  res: Response
) => {
  const userId = req.userId;
  let creditsDeducted = false;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, MAX_PROJECT_ID_LENGTH);

    if (!projectId) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const message = normalizeText(req.body?.message, MAX_MESSAGE_LENGTH);

    if (!message) {
      return res.status(400).json({ message: "Valid prompt required" });
    }

    const currentProject = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
        current_code: true,
      },
    });

    if (!currentProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const debitResult = await prisma.user.updateMany({
      where: {
        id: userId,
        credits: {
          gte: CREDIT_COST,
        },
      },
      data: {
        credits: {
          decrement: CREDIT_COST,
        },
      },
    });

    if (debitResult.count !== 1) {
      return res.status(403).json({ message: "Add more credits" });
    }

    creditsDeducted = true;

    await prisma.conversation.create({
      data: {
        role: "user",
        content: message,
        projectId,
      },
    });

    const codeResponse = await openai.chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: buildHtmlGenerationMessages({
        currentCode: currentProject.current_code ?? null,
        requestText: message,
      }),
      temperature: 0.5,
    });

    const rawCode = codeResponse.choices[0]?.message?.content ?? "";
    const code = stripCodeFences(rawCode);

    if (!code) {
      throw new Error("EMPTY_GENERATED_CODE");
    }

    const version = await prisma.version.create({
      data: {
        code,
        description: currentProject.current_code ? "Revision made" : "Initial version",
        projectId,
      },
    });

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: code,
        current_version_index: version.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: currentProject.current_code
          ? "Changes done."
          : "Website generated successfully.",
        projectId,
      },
    });

    return res.status(201).json({
      projectId,
      versionId: version.id,
    });
  } catch (error: unknown) {
    if (creditsDeducted) {
      try {
        await prisma.user.update({
          where: { id: userId as string },
          data: {
            credits: {
              increment: CREDIT_COST,
            },
          },
        });
      } catch {
        // Best-effort refund only.
      }
    }

    const message =
      error instanceof Error ? error.message : "Something went wrong";

    if (message === "EMPTY_GENERATED_CODE") {
      return res.status(500).json({ message: "Generated code was empty" });
    }

    return res.status(500).json({ message });
  }
};

export const saveProjectCode = async (
  req: Request<ProjectParams, unknown, SaveProjectBody>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, MAX_PROJECT_ID_LENGTH);

    if (!projectId) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const code = normalizeText(req.body?.code, MAX_CODE_LENGTH);

    if (!code) {
      return res.status(400).json({ message: "Valid code required" });
    }

    const description =
      normalizeText(req.body?.description, 120) || "Manual save";

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const version = await prisma.$transaction(async (tx) => {
      const createdVersion = await tx.version.create({
        data: {
          code,
          description,
          projectId,
        },
      });

      await tx.websiteProject.update({
        where: { id: projectId },
        data: {
          current_code: code,
          current_version_index: createdVersion.id,
        },
      });

      return createdVersion;
    });

    return res.status(201).json({
      message: "Project code saved",
      versionId: version.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const rollBackToVersion = async (
  req: Request<VersionParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, MAX_PROJECT_ID_LENGTH);
    const versionId = normalizeText(req.params.versionId, MAX_VERSION_ID_LENGTH);

    if (!projectId || !versionId) {
      return res.status(400).json({ message: "Invalid projectId or versionId" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const targetVersion = await prisma.version.findFirst({
      where: {
        id: versionId,
        projectId,
      },
      select: {
        id: true,
        code: true,
      },
    });

    if (!targetVersion) {
      return res.status(404).json({ message: "Version not found" });
    }

    const rollbackVersion = await prisma.$transaction(async (tx) => {
      const createdVersion = await tx.version.create({
        data: {
          code: targetVersion.code,
          description: `Rollback to version ${targetVersion.id}`,
          projectId,
        },
      });

      await tx.websiteProject.update({
        where: { id: projectId },
        data: {
          current_code: targetVersion.code,
          current_version_index: createdVersion.id,
        },
      });

      await tx.conversation.create({
        data: {
          role: "assistant",
          content: `Rolled back to version ${targetVersion.id}.`,
          projectId,
        },
      });

      return createdVersion;
    });

    return res.json({
      message: "Rollback completed",
      versionId: rollbackVersion.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const deleteProject = async (
  req: Request<ProjectParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, MAX_PROJECT_ID_LENGTH);

    if (!projectId) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.conversation.deleteMany({
        where: { projectId },
      });

      await tx.version.deleteMany({
        where: { projectId },
      });

      await tx.websiteProject.delete({
        where: { id: projectId },
      });
    });

    return res.json({ message: "Project deleted" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const getProjectPreview = async (
  req: Request<ProjectParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = normalizeText(req.params.projectId, MAX_PROJECT_ID_LENGTH);

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

export const getPublishedProjects = async (
  req: Request,
  res: Response
) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        initial_prompt: true,
        current_code: true,
        current_version_index: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ projects });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};

export const getProjectById = async (
  req: Request<ProjectIdParam>,
  res: Response
) => {
  try {
    const projectId = normalizeText(req.params.projectId, MAX_PROJECT_ID_LENGTH);

    if (!projectId) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId,
        isPublished: true,
      },
      include: {
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