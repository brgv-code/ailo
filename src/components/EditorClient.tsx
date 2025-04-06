"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { readFileAction, writeFileAction } from "@/actions/fileActions";
import { useFileSystem } from "@/context/FileSystemContext";

const MonacoEditor = dynamic(() => import("./MonacoEditorWrapper"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

interface EditorClientProps {
  filePath: string;
  language: string;
}

export default function EditorClient({
  filePath,
  language,
}: EditorClientProps) {
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { projectName } = useFileSystem();

  useEffect(() => {
    async function loadContent() {
      try {
        const fileContent = await readFileAction(projectName, filePath);
        setContent(fileContent);
      } catch (error) {
        console.error("Error loading file:", error);
      }
    }

    loadContent();
  }, [filePath, projectName]);

  const handleChange = (newContent: string) => {
    setContent(newContent);

    const debounceTimer = setTimeout(async () => {
      try {
        setIsSaving(true);
        await writeFileAction(projectName, filePath, newContent);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving file:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  };

  return (
    <div className="h-full flex flex-col">
      {lastSaved && (
        <div className="px-2 py-1 text-xs text-right text-zinc-400">
          {isSaving
            ? "Saving..."
            : `Last saved: ${lastSaved.toLocaleTimeString()}`}
        </div>
      )}
      <div className="flex-1">
        <MonacoEditor
          language={language}
          value={content}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
