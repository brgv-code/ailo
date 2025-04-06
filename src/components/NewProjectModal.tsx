"use client";

import { useState, useCallback } from "react";
import {
  createProject,
  createProjectFromTemplate,
  cloneGitRepository,
  getAvailableTemplates,
} from "@/actions/fileActions";
import { useEffect, useRef } from "react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectName: string) => void;
}

export type ProjectMode = "empty" | "template" | "git";

export default function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [mode, setMode] = useState<ProjectMode>("empty");
  const [gitUrl, setGitUrl] = useState("");
  const [gitBranch, setGitBranch] = useState("");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectName("");
      setMode("empty");
      setGitUrl("");
      setGitBranch("");
      setSelectedTemplate("");
      setError("");

      setTimeout(() => {
        const input = document.getElementById("project-name-input");
        if (input) input.focus();
      }, 100);

      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const availableTemplates = await getAvailableTemplates();
      setTemplates(availableTemplates);
      if (availableTemplates.length > 0) {
        setSelectedTemplate(availableTemplates[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError("Failed to load project templates");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let success = false;

      if (mode === "empty") {
        success = await createProject(projectName);
      } else if (mode === "template" && selectedTemplate) {
        success = await createProjectFromTemplate(
          projectName,
          selectedTemplate
        );
      } else if (mode === "git" && gitUrl) {
        success = await cloneGitRepository(
          projectName,
          gitUrl,
          gitBranch || undefined
        );
      }

      if (success) {
        onProjectCreated(projectName);
        onClose();
      } else {
        setError("Failed to create project");
      }
    } catch (err: unknown) {
      console.error("Project creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="project-name-input" className="block mb-1">
              Project Name
            </label>
            <input
              id="project-name-input"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-awesome-project"
              required
            />
          </div>

          <div className="mb-4">
            <p className="mb-2">Project Type</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  mode === "empty" ? "bg-blue-600" : "bg-slate-700"
                }`}
                onClick={() => setMode("empty")}
              >
                Empty
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  mode === "template" ? "bg-blue-600" : "bg-slate-700"
                }`}
                onClick={() => setMode("template")}
              >
                Template
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  mode === "git" ? "bg-blue-600" : "bg-slate-700"
                }`}
                onClick={() => setMode("git")}
              >
                Git Repository
              </button>
            </div>
          </div>

          {mode === "template" && (
            <div className="mb-4">
              <label htmlFor="template-select" className="block mb-1">
                Select Template
              </label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "git" && (
            <>
              <div className="mb-4">
                <label htmlFor="git-url-input" className="block mb-1">
                  Git Repository URL
                </label>
                <input
                  id="git-url-input"
                  type="text"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/brgv-code/repository.git"
                  required={mode === "git"}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="git-branch-input" className="block mb-1">
                  Branch (optional)
                </label>
                <input
                  id="git-branch-input"
                  type="text"
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="main"
                />
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
