import { useParams } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";

const Preview = () => {
  const { projectId, versionId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const foundProject = dummyProjects.find(
        (project) => project.id === projectId
      );

      if (!foundProject) {
        setLoading(false);
        return;
      }

      if (versionId) {
        const version = foundProject.versions.find(
          (version) => version.id === versionId
        );

        if (version) {
          setProject({
            ...foundProject,
            current_code: version.code,
            current_version_index: version.id,
          });
        } else {
          setProject(foundProject);
        }
      } else {
        setProject(foundProject);
      }

      setLoading(false);
    }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [projectId, versionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
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
