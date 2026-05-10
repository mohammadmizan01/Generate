import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import api from "@/configs/axios";

const MyProject = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const { data } = await api.get("/api/user/projects");
        if (cancelled) return;
        setProjects(data.projects || []);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
        } else {
          toast.error("Failed to load projects");
        }
        if (!cancelled) setProjects([]);
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const deleteProject = async (projectId: string) => {
    const ok = window.confirm("Delete this project permanently?");
    if (!ok) return;

    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects((prev) => (prev ? prev.filter((p) => p.id !== projectId) : prev));
      toast.success("Project deleted");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
      } else {
        toast.error("Failed to delete project");
      }
    }
  };

  if (projects === null) {
    return (
      <div className="px-4 text-white md:px-16 lg:px-24 xl:px-32">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2Icon className="size-7 animate-spin text-indigo-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 text-white md:px-16 lg:px-24 xl:px-32">
      {projects.length > 0 ? (
        <div className="min-h-[80vh] py-10">
          <div className="mb-12 flex items-center justify-between">
            <h1 className="text-2xl font-medium text-white">My Projects</h1>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 px-3 py-1 text-white transition-all hover:opacity-90 active:scale-95 sm:px-6 sm:py-2"
            >
              <PlusIcon size={18} />
              Create New
            </button>
          </div>

          <div className="flex flex-wrap gap-3.5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative w-72 cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-gray-900/60 shadow-md transition-all duration-300 hover:border-indigo-800/80 hover:shadow-indigo-700/30 max-sm:mx-auto"
              >
                <div className="relative h-40 w-full overflow-hidden border-b border-gray-800 bg-gray-900">
                  {project.current_code ? (
                    <iframe
                      title={`Preview for project ${project.id}`}
                      srcDoc={project.current_code}
                      className="pointer-events-none absolute top-0 left-0 h-800px w-1200px origin-top-left scale-[0.25]"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      <p>No preview</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h2 className="line-clamp-2 text-lg font-medium">
                      {project.name}
                    </h2>

                    <button className="mt-1 ml-2 rounded-full border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs">
                      Website
                    </button>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {project.initial_prompt}
                  </p>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-6 flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex gap-3 text-sm text-white">
                      <button
                        onClick={() => navigate(`/preview/${project.id}`)}
                        className="rounded-md bg-white/10 px-3 py-1.5 transition-all hover:bg-white/15"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="rounded-md bg-white/10 px-3 py-1.5 transition-colors hover:bg-white/15"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <TrashIcon
                    className="absolute top-3 right-3 size-7 cursor-pointer rounded bg-white p-1.5 text-red-500 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100"
                    onClick={() => deleteProject(project.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[80vh] flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold text-gray-300">
            You have no projects yet!
          </h1>

          <button
            onClick={() => navigate("/")}
            className="px-5 text-white transition-all active:scale-95"
          >
            Create New
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProject;