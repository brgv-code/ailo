"use client";

import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/ResizablePanels";
import Editor from "@/components/Editor";
import Header from "@/components/Header";
import AIPanel from "@/components/AIPanel";
import ProjectList from "@/components/ProjectList";
import FileExplorer from "@/components/FileExplorer";
import Terminal from "@/components/Terminal";
import { FileSystemProvider } from "@/context/FileSystemContext";
import { ModelProvider } from "@/context/ModelContext";
import ModelSettings from "@/components/ModelSettings";

// Sidebar component
const Sidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full bg-slate-800 overflow-hidden">{children}</div>
  );
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isExplorerExpanded, setIsExplorerExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"files" | "projects">("files");
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);

  useEffect(() => {
    const savedProject = localStorage.getItem("lastProject");
    if (savedProject) {
      setCurrentProject(savedProject);
    }
  }, []);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem("lastProject", currentProject);
    }
  }, [currentProject]);

  const handleProjectChange = () => {
    setActiveTab("projects");
    setSelectedFile(null);
  };

  const handleSelectProject = (projectName: string) => {
    setCurrentProject(projectName);
    setActiveTab("files");
    setSelectedFile(null);
  };

  const toggleSidebar = () => {
    setIsExplorerExpanded((prev) => !prev);
  };

  return (
    <ModelProvider>
      <FileSystemProvider projectName={currentProject || ""}>
        <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
          <Header
            onProjectChange={handleProjectChange}
            onToggleSidebar={toggleSidebar}
            onModelSettings={() => setIsModelSettingsOpen(true)}
          />

          <div className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
              {isExplorerExpanded && (
                <>
                  <ResizablePanel defaultSize={10} minSize={5}>
                    <Sidebar>
                      <div className="h-full flex flex-col">
                        <div className="border-b border-slate-700 flex">
                          <button
                            className={`px-4 py-2 flex-1 ${
                              activeTab === "files"
                                ? "border-b-2 border-blue-500"
                                : ""
                            }`}
                            onClick={() => setActiveTab("files")}
                          >
                            Files
                          </button>
                          <button
                            className={`px-4 py-2 flex-1 ${
                              activeTab === "projects"
                                ? "border-b-2 border-blue-500"
                                : ""
                            }`}
                            onClick={() => setActiveTab("projects")}
                          >
                            Projects
                          </button>
                        </div>

                        <div className="flex-1 overflow-auto">
                          {activeTab === "files" && currentProject ? (
                            <FileExplorer
                              projectName={currentProject}
                              onSelectFile={setSelectedFile}
                              selectedFile={selectedFile}
                            />
                          ) : (
                            <ProjectList
                              currentProject={currentProject}
                              onSelectProject={handleSelectProject}
                            />
                          )}
                        </div>
                      </div>
                    </Sidebar>
                  </ResizablePanel>
                  <ResizableHandle />
                </>
              )}

              <ResizablePanel
                defaultSize={isExplorerExpanded ? 50 : 70}
                minSize={30}
              >
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={70} minSize={30}>
                    <div className="h-full w-full">
                      {selectedFile && currentProject ? (
                        <Editor
                          filePath={selectedFile}
                          projectName={currentProject}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          {currentProject ? (
                            <div className="text-center">
                              <h2 className="text-2xl font-bold mb-2">
                                No File Selected
                              </h2>
                              <p>
                                Select a file from the explorer or create a new
                                file
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <h2 className="text-2xl font-bold mb-2">
                                No Project Selected
                              </h2>
                              <p>
                                Select a project or create a new one to get
                                started
                              </p>
                              <button
                                className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                                onClick={() => setActiveTab("projects")}
                              >
                                Go to Projects
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </ResizablePanel>

                  <ResizableHandle direction="vertical" />

                  <ResizablePanel defaultSize={30} minSize={15}>
                    <div className="h-full w-full bg-black">
                      <Terminal />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle />
              <ResizablePanel defaultSize={15} minSize={10}>
                <AIPanel fileName={selectedFile} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          <ModelSettings
            isOpen={isModelSettingsOpen}
            onClose={() => setIsModelSettingsOpen(false)}
          />
        </div>
      </FileSystemProvider>
    </ModelProvider>
  );
}
