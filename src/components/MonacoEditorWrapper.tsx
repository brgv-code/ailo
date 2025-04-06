"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export default function MonacoEditorWrapper(props: MonacoEditorProps) {
  const { language, value, onChange } = props;

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "var(--font-geist-mono)",
      }}
    />
  );
}
