"use client";

import { useState, useEffect } from "react";
import { getProjects } from "@/actions/fileActions";
import NewProjectModal from "./NewProjectModal";

interface ProjectListProps {
  currentProject: string | null;
  onSelectProject: (project: string) => void;
}

export default function ProjectList({
  currentProject,
  onSelectProject,
}: ProjectListProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectList = await getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (projectName: string) => {
    fetchProjects();
    if (projectName) {
      onSelectProject(projectName);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-500 transition"
        >
          New Project
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-center text-slate-400">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="py-4 text-center text-slate-400">
          <p>No projects yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-blue-400 hover:underline"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <ul className="space-y-1">
          {projects.map((project) => (
            <li
              key={project}
              className={`px-3 py-2 rounded cursor-pointer ${
                currentProject === project
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`}
              onClick={() => onSelectProject(project)}
            >
              {project}
            </li>
          ))}
        </ul>
      )}

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
