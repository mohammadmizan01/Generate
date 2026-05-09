import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";

const CREDIT_COST = 5;
const MAX_PROMPT_LENGTH = 4000;
const MAX_PROJECT_NAME_LENGTH = 50;

type ProjectParams = {
  projectId: string;
};

type CreateProjectBody = {
  initial_prompt?: unknown;
};

function normalizePrompt(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_PROMPT_LENGTH) return null;

  return trimmed;
}

function buildProjectName(prompt: string): string {
  if (prompt.length <= MAX_PROJECT_NAME_LENGTH) return prompt;
  return `${prompt.slice(0, MAX_PROJECT_NAME_LENGTH - 3)}...`;
}

function stripCodeFences(content: string): string {
  return content
    .replace(/```(?:html|markdown|md|json|js|tsx|ts)?\n?/gi, "")
    .replace(/```/g, "")
    .trim();
}

function getSingleParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

// Get user credits
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

// controller function to create new project
export const createUserProject = async (
  req: Request<{}, {}, CreateProjectBody>,
  res: Response
) => {
  const userId = req.userId;
  let projectId: string | null = null;
  let creditsDeducted = false;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const initialPrompt = normalizePrompt(req.body?.initial_prompt);

    if (!initialPrompt) {
      return res.status(400).json({
        message:
          "initial_prompt must be a non-empty string within the allowed length",
      });
    }

    const project = await prisma.$transaction(async (tx) => {
      const debitResult = await tx.user.updateMany({
        where: {
          id: userId,
          credits: {
            gte: CREDIT_COST,
          },
        },
        data: {
          credits: { decrement: CREDIT_COST },
          totalCreation: { increment: 1 },
        },
      });

      if (debitResult.count !== 1) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const createdProject = await tx.websiteProject.create({
        data: {
          name: buildProjectName(initialPrompt),
          initial_prompt: initialPrompt,
          userId,
        },
      });

      await tx.conversation.create({
        data: {
          role: "user",
          content: initialPrompt,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    });

    projectId = project.id;
    creditsDeducted = true;

    const promptEnhanceResponse = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        {
          role: "system",
          content:
            "You are a prompt enhancement specialist. Expand the user's website request into a detailed, concise, actionable brief for a web developer. Include layout, sections, UX, responsiveness, styling direction, and any missing important details. Return only the enhanced prompt.",
        },
        {
          role: "user",
          content: initialPrompt,
        },
      ],
    });

    const enhancedPrompt =
      promptEnhanceResponse.choices[0]?.message?.content?.trim() || initialPrompt;

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `Enhanced prompt generated successfully:\n\n${enhancedPrompt}`,
        projectId: project.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "Generating your website now.",
        projectId: project.id,
      },
    });

    const codeGenerationResponse = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        {
          role: "system",
          content: `You are an expert web developer. Create a complete, production-ready, single-page website based on this request.

Requirements:
- Output valid HTML only
- Use Tailwind CSS for all styling
- Include the script tag: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- Make it fully responsive
- Include interactive JavaScript in a script tag before </body>
- Use modern, beautiful design
- Return only the HTML, no markdown, no explanation, no code fences`,
        },
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
    });

    const rawCode = codeGenerationResponse.choices[0]?.message?.content ?? "";
    const code = stripCodeFences(rawCode);

    if (!code) {
      throw new Error("EMPTY_GENERATED_CODE");
    }

    const version = await prisma.version.create({
      data: {
        code,
        description: "Initial version",
        projectId: project.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "preview it",
        projectId: project.id,
      },
    });

    await prisma.websiteProject.update({
      where: { id: project.id },
      data: {
        current_code: code,
        current_version_index: version.id,
      },
    });

    return res.status(201).json({
      projectId: project.id,
      versionId: version.id,
    });
  } catch (error: unknown) {
    if (creditsDeducted && projectId) {
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
        // Best-effort refund only. In production, log this with projectId and userId.
      }
    }

    const message =
      error instanceof Error ? error.message : "Something went wrong";

    if (message === "INSUFFICIENT_CREDITS") {
      return res.status(403).json({ message: "Add credits" });
    }

    return res.status(500).json({ message });
  }
};

// a single project
export const getUserProject = async (
  req: Request<ProjectParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = getSingleParam(req.params.projectId);

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

// all user projects
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

// toggle publish
export const togglePublish = async (
  req: Request<ProjectParams>,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = getSingleParam(req.params.projectId);

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

    const newPublishedState = !project.isPublished;

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { isPublished: newPublishedState },
    });

    return res.json({
      message: newPublishedState ? "Project published" : "Project unpublished",
      isPublished: newPublishedState,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ message });
  }
};