import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dummyProjects } from "../assets/assets";

const MyProject = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  const navigate = useNavigate();

//   const deleteProjecct = async (projectId:string) {
    
//   }

  useEffect(() => {
    const fetchProjects = async () => {
      setProjects(dummyProjects);

      const timer = window.setTimeout(() => {
        setLoading(false);
      }, 1000);

      return timer;
    };

    let timer: number;

    fetchProjects().then((timeoutId) => {
      timer = timeoutId;
    });

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return (
    <>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32 text-white">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="size-7 animate-spin text-indigo-200" />
          </div>
        ) : projects.length > 0 ? (
          <div className="py-10 min-h-[80vh]">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-2xl font-medium text-white">My Projects</h1>

              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-white px-3 sm:px-6 py-1 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all"
              >
                <PlusIcon size={18} />
                Create New
              </button>
            </div>

            <div className="flex flex-wrap gap-3.5">
              {projects.map((project) => (
                <div 
                onClick={() => navigate(`/projects/${project.id}`)}
                  key={project.id}
                  className="relative group w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300"
                >
                  <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                    {project.current_code ? (
                      <iframe
                        title={`Preview for project ${project.id}`}
                        srcDoc={project.current_code}
                        className="absolute top-0 left-0 w-305 h-200 origin-top-left pointer-events-none"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ transform: "scale(0.25)" }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No preview</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium line-clamp-2">
                        {project.name}
                      </h2>

                      <button className="px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full">
                        Website
                      </button>
                    </div>

                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                      {project.initial_prompt}
                    </p>
                    <div onClick={(e) => e.stopPropagation()}
                    className="flex justify-between items-center mt-6">
                        <span>{new Date(project.createdAt).toLocaleDateString()} </span>
                        <div className="flex gap-3 text-white text-sm">
                            <button onClick={() => navigate(`/preview/${project.id}`)} 
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/15
                            roundec-md transition-all">Preview</button>
                            <button onClick={() => navigate(`/projects/${project.id}`)} 
                             className="px-3 py-1.5 bg-white/10 hover:bg-white/15
                            roundec-md transition-colors"
                            >Open
                            </button>
                     </div> 
                    </div>
                  </div>
                    <div onClick={e=> e.stopPropagation}>
                        <TrashIcon className="absolute top-3 right-3
                        scale-0 group-hover:scale-100 bg-white p-1.5 size-7
                        rounded text-red-500 text-xl cursor-pointert transition-all"
                        onClick={()=> deleteProjecct(project.id)}/>
                         
                     </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-3xl font-semibold text-gray-300">
              You have no projects yet!
            </h1>

            <button
              onClick={() => navigate("/")}
              className="text-white px-5 active:scale-95 transition-all"
            >
              Create New
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MyProject;
