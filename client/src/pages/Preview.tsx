import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import api from "@/configs/axios";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";

const Preview = () => {
  const { projectId, versionId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data } = await api.get(`/api/projects/preview/${projectId}`);
        const fetchedProject: Project = data.project;

        if (versionId && fetchedProject.versions?.length) {
          const version = fetchedProject.versions.find(
            (item) => item.id === versionId
          );

          if (version) {
            setProject({
              ...fetchedProject,
              current_code: version.code,
              current_version_index: version.id,
            });
          } else {
            setProject(fetchedProject);
          }
        } else {
          setProject(fetchedProject);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
        } else {
          toast.error("Unable to load preview");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchPreview();
  }, [projectId, versionId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        Unable to load preview.
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ProjectPreview
        project={project}
        isGenerating={false}
        showEditorPanel={false}
      />
    </div>
  );
};

export default Preview;