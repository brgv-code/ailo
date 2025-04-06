"use client";

import React, { useState } from "react";
import { useModel } from "@/context/ModelContext";
import { useFileSystem } from "@/context/FileSystemContext";

interface HeaderProps {
  onProjectChange?: () => void;
  onToggleSidebar?: () => void;
  onModelSettings?: () => void;
}

export default function Header({
  onProjectChange,
  onToggleSidebar,
  onModelSettings,
}: HeaderProps) {
  const { currentModel, modelType } = useModel();
  const { createFile, projectName } = useFileSystem();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;

    try {
      await createFile(newFileName);
      setNewFileName("");
      setIsCreatingFile(false);
    } catch (error) {
      console.error("Error creating file:", error);
      alert(`Error creating file: ${(error as Error).message}`);
    }
  };

  return (
    <header className="flex justify-between items-center p-2 bg-slate-950 border-b border-slate-800">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="mr-3 text-sm p-1 hover:bg-slate-800 rounded"
          title="Toggle sidebar"
        >
          ☰
        </button>

        <div className="flex items-center mr-4">
          <h1 className="text-xl font-bold mr-2">DIY Cursor</h1>
          <span className="text-sm bg-slate-800 py-1 px-2 rounded">
            {projectName}
          </span>
          {onProjectChange && (
            <button
              onClick={onProjectChange}
              className="ml-2 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded"
            >
              Switch
            </button>
          )}
        </div>
        <button
          className="px-2 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded mr-2"
          onClick={() => setIsCreatingFile(true)}
        >
          New File
        </button>
        <button
          className="px-2 py-1 text-sm bg-slate-800 hover:bg-slate-700 rounded"
          onClick={onModelSettings}
        >
          {currentModel ? `Model: ${currentModel}` : "Load Model"}
        </button>
      </div>
      <div className="text-sm text-slate-400">
        {currentModel
          ? `Using ${
              modelType === "local" ? "Ollama" : modelType
            }: ${currentModel}`
          : "No model loaded - Local AI Only"}
      </div>

      {isCreatingFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-4 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Create New File</h2>
            <form onSubmit={handleCreateFile}>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name (e.g., main.js)"
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
