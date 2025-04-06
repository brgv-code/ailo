import React from "react";
import { useFileSystem } from "@/context/FileSystemContext";
import EditorClient from "./EditorClient";

interface EditorProps {
  filePath?: string;
  projectName?: string;
}

export default function Editor({ filePath }: EditorProps) {
  const { currentFile } = useFileSystem();

  const fileToEdit = filePath || currentFile;

  if (!fileToEdit) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p>No file selected</p>
          <p className="text-sm mt-2">
            Create or select a file from the explorer
          </p>
        </div>
      </div>
    );
  }

  const getLanguageFromFileName = (fileName: string): string => {
    if (fileName.endsWith(".js")) return "javascript";
    if (fileName.endsWith(".jsx")) return "javascript";
    if (fileName.endsWith(".ts")) return "typescript";
    if (fileName.endsWith(".tsx")) return "typescript";
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".json")) return "json";
    if (fileName.endsWith(".md")) return "markdown";
    return "plaintext";
  };

  const language = getLanguageFromFileName(fileToEdit);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b border-slate-700 text-sm font-mono bg-slate-800">
        {fileToEdit}
      </div>
      <div className="flex-1">
        <EditorClient filePath={fileToEdit} language={language} />
      </div>
    </div>
  );
}
