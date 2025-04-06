import React, { useState, useEffect } from "react";

interface FileExplorerProps {
  projectName: string;
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
}

export default function FileExplorer({
  projectName,
  selectedFile,
  onSelectFile,
}: FileExplorerProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const response = await fetch(`/api/files?project=${projectName}`);
        if (!response.ok) {
          throw new Error(`Error fetching files: ${response.statusText}`);
        }
        const data = await response.json();
        setFiles(data.files || []);
      } catch (error) {
        console.error("Failed to load files", error);
        setFiles([
          "README.md",
          "pages/index.js",
          "next.config.js",
          "package.json",
        ]);
      } finally {
        setLoading(false);
      }
    }

    if (projectName) {
      loadFiles();
    }
  }, [projectName]);

  if (loading) {
    return <div className="p-4 text-slate-400">Loading files...</div>;
  }

  if (files.length === 0) {
    return <div className="p-4 text-slate-400">No files in this project</div>;
  }

  const filesByDirectory: Record<string, string[]> = {};

  files.forEach((file) => {
    const parts = file.split("/");
    const isInRoot = parts.length === 1;

    if (isInRoot) {
      if (!filesByDirectory["root"]) filesByDirectory["root"] = [];
      filesByDirectory["root"].push(file);
    } else {
      const dir = parts.slice(0, -1).join("/");
      if (!filesByDirectory[dir]) filesByDirectory[dir] = [];
      filesByDirectory[dir].push(file);
    }
  });

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2">Files</h3>
      <div className="space-y-2">
        {filesByDirectory["root"] && (
          <ul className="space-y-1">
            {filesByDirectory["root"].map((file) => (
              <li
                key={file}
                className={`px-2 py-1 rounded cursor-pointer ${
                  selectedFile === file ? "bg-blue-600" : "hover:bg-slate-700"
                }`}
                onClick={() => onSelectFile(file)}
              >
                {file}
              </li>
            ))}
          </ul>
        )}

        {Object.keys(filesByDirectory)
          .filter((dir) => dir !== "root")
          .sort()
          .map((dir) => (
            <div key={dir} className="mt-2">
              <div className="font-medium text-sm text-slate-400 px-2 mb-1">
                {dir}/
              </div>
              <ul className="space-y-1 pl-3">
                {filesByDirectory[dir].map((file) => (
                  <li
                    key={file}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      selectedFile === file
                        ? "bg-blue-600"
                        : "hover:bg-slate-700"
                    }`}
                    onClick={() => onSelectFile(file)}
                  >
                    {file.split("/").pop()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
