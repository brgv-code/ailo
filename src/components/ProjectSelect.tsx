"use client";

import React, { useEffect, useState } from "react";
import { getProjects, createProject } from "@/actions/fileActions";

interface ProjectSelectProps {
  onProjectSelect: (projectName: string) => void;
}

export default function ProjectSelect({ onProjectSelect }: ProjectSelectProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const projectList = await getProjects();
        setProjects(projectList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading projects:", error);
        setError("Failed to load projects");
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      setError("Project name cannot be empty");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newProjectName)) {
      setError(
        "Project name can only contain letters, numbers, dashes, and underscores"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const success = await createProject(newProjectName);

      if (success) {
        onProjectSelect(newProjectName);
      } else {
        setError("Failed to create project");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-zinc-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center">DIY Cursor</h1>

        {loading ? (
          <div className="text-center">Loading projects...</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
                {error}
              </div>
            )}

            {!showCreateForm ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Select a Project
                  </h2>

                  {projects.length === 0 ? (
                    <div className="text-zinc-400 mb-6">
                      No projects found. Create your first project!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {projects.map((project) => (
                        <button
                          key={project}
                          onClick={() => onProjectSelect(project)}
                          className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded text-left transition-colors"
                        >
                          <div className="font-medium">{project}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded font-medium"
                  >
                    Create New Project
                  </button>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Create New Project
                </h2>
                <form onSubmit={handleCreateProject}>
                  <div className="mb-4">
                    <label htmlFor="projectName" className="block mb-2">
                      Project Name
                    </label>
                    <input
                      id="projectName"
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="my-project"
                      autoFocus
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      Only use letters, numbers, dashes, and underscores
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 p-2 border border-zinc-600 rounded hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 p-2 bg-blue-600 hover:bg-blue-500 rounded"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Project"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
