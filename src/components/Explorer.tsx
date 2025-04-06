"use client";

import React from "react";
import { useFileSystem } from "@/context/FileSystemContext";

export default function Explorer() {
  const { fileList, currentFile, setCurrentFile, deleteFile } = useFileSystem();

  const handleFileClick = (path: string) => {
    setCurrentFile(path);
  };

  const handleDeleteFile = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      try {
        await deleteFile(path);
      } catch (error) {
        console.error("Error deleting file:", error);
        alert(`Error deleting file: ${(error as Error).message}`);
      }
    }
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "📄 ";
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "📄 ";
    if (path.endsWith(".html")) return "📄 ";
    if (path.endsWith(".css")) return "📄 ";
    if (path.endsWith(".json")) return "📄 ";
    if (path.endsWith(".md")) return "📄 ";
    return "📄 ";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b border-zinc-700">
        <h2 className="text-sm font-bold">Explorer</h2>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {fileList.length === 0 ? (
          <p className="text-sm text-zinc-500 p-2">No files yet</p>
        ) : (
          <ul className="text-sm">
            {fileList.map((path) => (
              <li
                key={path}
                className={`flex justify-between items-center p-1 rounded cursor-pointer hover:bg-zinc-700 ${
                  currentFile === path ? "bg-zinc-700" : ""
                }`}
                onClick={() => handleFileClick(path)}
              >
                <span className="truncate">
                  {getFileIcon(path)} {path}
                </span>
                <button
                  onClick={(e) => handleDeleteFile(path, e)}
                  className="opacity-30 hover:opacity-100 text-red-500"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
