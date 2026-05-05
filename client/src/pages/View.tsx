import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";

const View = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const foundProject = dummyProjects.find(
        (project) => project.id === projectId
      );

      if (foundProject) {
        setProject(foundProject);
      }

      setLoading(false);
    }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [projectId]);

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
        Unable to load view.
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

export default View;
