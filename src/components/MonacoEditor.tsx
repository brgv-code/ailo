"use client";

import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export default function MonacoEditor({
  language,
  value,
  onChange,
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  useEffect(() => {
    if (editorRef.current && !monacoInstanceRef.current) {
      monacoInstanceRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: "vs-dark",
        automaticLayout: true,
        minimap: {
          enabled: true,
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "var(--font-geist-mono)",
      });

      monacoInstanceRef.current.onDidChangeModelContent(() => {
        const editorValue = monacoInstanceRef.current?.getValue() || "";
        onChange(editorValue);
      });
    }

    return () => {
      if (monacoInstanceRef.current) {
        monacoInstanceRef.current.dispose();
        monacoInstanceRef.current = null;
      }
    };
  }, [language, onChange, value]);

  useEffect(() => {
    if (monacoInstanceRef.current) {
      const currentValue = monacoInstanceRef.current.getValue();
      if (currentValue !== value) {
        monacoInstanceRef.current.setValue(value);
      }

      const model = monacoInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language, value]);

  return <div ref={editorRef} className="h-full w-full" />;
}
