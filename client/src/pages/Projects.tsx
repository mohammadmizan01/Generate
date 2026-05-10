import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquare,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import SideBar from "../components/SideBar";
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview";
import api from "@/configs/axios";
import type { Project } from "../types";

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("desktop");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      if (!projectId) return;

      try {
        const { data } = await api.get(`/api/user/projects/${projectId}`);

        if (cancelled) return;

        setProject(data.project);
        setIsGenerating(!data.project?.current_code);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
        } else {
          toast.error("Failed to load project");
        }
      }
    };

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const saveProject = async () => {
    if (!projectId) return;

    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) {
      toast.error("No code to save");
      return;
    }

    try {
      setIsSaving(true);
      await api.put(`/api/projects/${projectId}/save`, {
        code,
        description: "Manual save",
      });
      toast.success("Project saved");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to save project");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;

    if (!code) {
      if (isGenerating) return;
      toast.error("No code available to download");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const togglePublish = async () => {
    if (!projectId || !project) return;

    try {
      const { data } = await api.patch(`/api/user/projects/${projectId}/publish`);

      setProject((prev) =>
        prev ? { ...prev, isPublished: data.isPublished } : prev
      );

      toast.success(data.message || "Updated publish status");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to update publish status");
      }
    }
  };

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2Icon className="size-7 animate-spin text-violet-200" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
      <div className="flex gap-4 overflow-x-auto px-4 py-2 sm:items-center">
        <div className="flex min-w-0 items-center gap-2 text-nowrap sm:min-w-90">
          <img
            src="/favicon.svg"
            alt="logo"
            className="h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />

          <div className="max-w-64 sm:max-w-xs">
            <p className="truncate text-sm font-medium capitalize">
              {project.name}
            </p>
            <p className="text-xs text-gray-400 -mt-0.5">
              Previewing last saved version
            </p>
          </div>

          <div className="flex-1 justify-end sm:hidden flex">
            {isMenuOpen ? (
              <XIcon
                onClick={() => setIsMenuOpen(false)}
                className="size-6 cursor-pointer"
              />
            ) : (
              <MessageSquare
                onClick={() => setIsMenuOpen(true)}
                className="size-6 cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SmartphoneIcon
            onClick={() => setDevice("phone")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "phone" ? "bg-gray-700" : ""
            }`}
          />
          <TabletIcon
            onClick={() => setDevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "tablet" ? "bg-gray-700" : ""
            }`}
          />
          <LaptopIcon
            onClick={() => setDevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${
              device === "desktop" ? "bg-gray-700" : ""
            }`}
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 text-xs sm:text-sm">
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="max-sm:hidden flex items-center gap-2 rounded border border-gray-700 bg-gray-800 px-3.5 py-1 text-white transition-colors hover:bg-gray-700 disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            Save
          </button>

          <Link
            target="_blank"
            to={`/preview/${projectId}`}
            className="flex items-center gap-2 rounded border border-gray-700 px-4 py-1 transition-colors hover:border-gray-500"
          >
            <FullscreenIcon size={16} />
            Preview
          </Link>

          <button
            onClick={downloadCode}
            className="flex items-center gap-2 rounded bg-linear-to-br from-blue-700 to-blue-600 px-3.5 py-1 text-white transition-colors hover:from-blue-600 hover:to-blue-500"
          >
            <ArrowBigDownDashIcon size={16} />
            Download
          </button>

          <button
            onClick={togglePublish}
            className="flex items-center gap-2 rounded bg-linear-to-br from-indigo-700 to-indigo-600 px-3.5 py-1 text-white transition-colors hover:from-indigo-600 hover:to-indigo-500"
          >
            {project.isPublished ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto">
        <SideBar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={setProject}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        <div className="flex-1 p-2 pl-0">
          <ProjectPreview
            ref={previewRef}
            project={project}
            isGenerating={isGenerating}
            device={device}
          />
        </div>
      </div>
    </div>
  );
};

export default Projects;