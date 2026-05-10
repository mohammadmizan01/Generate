import { forwardRef, useImperativeHandle, useRef } from "react";
import { iframeScript } from "../assets/assets";
import type { Project } from "../types";
import LoaderSteps from "./LooderSteps";

interface ProjectPreviewProps {
  project: Project;
  isGenerating: boolean;
  device?: "phone" | "tablet" | "desktop";
  showEditorPanel?: boolean;
}

export interface ProjectPreviewRef {
  getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  (
    {
      project,
      isGenerating,
      device = "desktop",
      showEditorPanel = true,
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const resolutions = {
      phone: "w-[412px]",
      tablet: "w-[768px]",
      desktop: "w-full",
    };

    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument;

        if (!doc) return undefined;

        doc
          .querySelectorAll(".ai-selected-element,[data-ai-selected]")
          .forEach((el: Element) => {
            el.classList.remove("ai-selected-element");
            el.removeAttribute("data-ai-selected");

            if (el instanceof HTMLElement) {
              el.style.outline = "";
            }
          });

        const previewStyle = doc.getElementById("ai-preview-style");
        if (previewStyle) previewStyle.remove();

        const previewScript = doc.getElementById("ai-preview-script");
        if (previewScript) previewScript.remove();

        return doc.documentElement.outerHTML;
      },
    }));

    const injectPreview = (html: string) => {
      if (!html) return "";
      if (!showEditorPanel) return html;

      if (html.includes("</body>")) {
        return html.replace("</body>", `${iframeScript}</body>`);
      }

      return html + iframeScript;
    };

    return (
      <div className="relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2">
        {project.current_code ? (
          <iframe
            ref={iframeRef}
            title="Project Preview"
            srcDoc={injectPreview(project.current_code)}
            className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}
            sandbox="allow-scripts"
          />
        ) : (
          isGenerating && <LoaderSteps/>
        )}
      </div>
    );
  }
);

export default ProjectPreview;
