import {
  BotIcon,
  EyeIcon,
  Loader2Icon,
  SendIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Message, Project, Version } from "../types";

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project;
  setProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const SideBar = ({
  isMenuOpen,
  project,
  setProject,
  isGenerating,
  setIsGenerating,
}: SidebarProps) => {
  const [input, setInput] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);

  const timeline = useMemo(() => {
    return [...(project.conversation ?? []), ...(project.versions ?? [])].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [project.conversation, project.versions]);

  const handleRollback = async (versionId: string) => {
    const version = project.versions.find((item) => item.id === versionId);

    if (!version) return;

    setProject({
      ...project,
      current_code: version.code,
      current_version_index: version.id,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim() || isGenerating) return;

    setInput("");
    setIsGenerating(true);
    setTimeout(() =>{
      setIsGenerating(false)
    },3000)
  };

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [project.conversation.length, project.versions.length, isGenerating]);

  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${
        isMenuOpen ? "w-full" : "max-sm:w-0 max-sm:overflow-hidden w-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4">
          {timeline.map((item) => {
            if ("content" in item) {
              const msg = item as Message;
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div>
                      <BotIcon className="size-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${
                      isUser
                        ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none"
                        : "rounded-tl-none bg-gray-800 text-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <UserIcon className="size-5 text-gray-200" />
                    </div>
                  )}
                </div>
              );
            }

            const ver = item as Version;

            return (
              <div
                key={ver.id}
                className="w-4/5 mx-auto my-2 py-3 px-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2"
              >
                <div className="text-gray-500 text-xs font-normal">
                  code updated <br />
                  <span>{new Date(ver.timestamp).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {project.current_version_index === ver.id ? (
                    <button className="px-3 py-1 rounded-md text-xs bg-gray-700">
                      Current Version
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRollback(ver.id)}
                      className="px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Roll back to this version
                    </button>
                  )}

                  <Link target="_blank" to={`/preview/${project.id}/${ver.id}`}>
                    <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded" />
                  </Link>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-start gap-3 justify-start">
              <div>
                <BotIcon className="size-5 text-white" />
              </div>

              <div className="flex gap-1.5 h-full items-end">
                <span className="size-2 rounded-full animate-bounce bg-gray-600" />
                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}

          <div ref={messageRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
          <textarea
            onChange={(event) => setInput(event.target.value)}
            value={input}
            rows={4}
            placeholder="Describe"
            disabled={isGenerating}
            className="flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all disabled:opacity-70"
          />

          <button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2Icon className="size-7 p-1.5 animate-spin text-white" />
            ) : (
              <SendIcon className="size-7 p-1.5 text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SideBar;
