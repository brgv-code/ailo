"use client";

import React, { useState, useRef, useEffect } from "react";
import { useModel } from "@/context/ModelContext";
import { useFileSystem } from "@/context/FileSystemContext";

interface AIPanelProps {
  fileName?: string | null;
}

export default function AIPanel({ fileName }: AIPanelProps) {
  const { currentModel, modelType, generateResponse } = useModel();
  const { currentFile, readFile, projectName } = useFileSystem();
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fileToUse = fileName !== undefined ? fileName : currentFile;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || isProcessing) return;

    const newConversation = [
      ...conversation,
      { role: "user" as const, content: prompt },
    ];
    setConversation(newConversation);
    setPrompt("");

    try {
      setIsProcessing(true);

      let contextPrompt = prompt;
      if (fileToUse) {
        try {
          const fileContent = await readFile(fileToUse);
          contextPrompt = `Project: ${projectName}\nCurrent file (${fileToUse}):\n\`\`\`\n${fileContent}\n\`\`\`\n\nUser question: ${prompt}`;
        } catch (error) {
          console.error("Error reading file for context:", error);
        }
      } else {
        contextPrompt = `Project: ${projectName}\n\nUser question: ${prompt}`;
      }

      const response = await generateResponse(contextPrompt);

      setConversation([
        ...newConversation,
        { role: "assistant" as const, content: response },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setConversation([
        ...newConversation,
        {
          role: "assistant" as const,
          content: `Error: ${
            (error as Error).message
          }\n\nMake sure you've loaded a model first.`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearConversation = () => {
    if (window.confirm("Clear the conversation history?")) {
      setConversation([]);
    }
  };

  const modelStatusText = () => {
    if (!currentModel) return "No Model";
    return `${modelType === "local" ? "Ollama" : modelType}: ${currentModel}`;
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="p-2 flex justify-between items-center border-b border-slate-700">
        <h2 className="text-sm font-bold">AI Assistant</h2>
        <div className="flex gap-2">
          <button
            onClick={handleClearConversation}
            className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded"
          >
            Clear
          </button>
          <div
            className={`text-xs px-2 py-1 rounded ${
              currentModel ? "bg-green-800" : "bg-slate-700"
            }`}
          >
            {modelStatusText()}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {conversation.length === 0 ? (
          <div className="text-center text-slate-500 h-full flex flex-col items-center justify-center">
            <p>No conversation yet</p>
            <p className="text-sm mt-2">
              {currentModel
                ? "Ask a question to get started"
                : "Load a model to enable AI capabilities"}
            </p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded max-w-[85%] ${
                message.role === "user" ? "bg-blue-800 ml-auto" : "bg-slate-800"
              }`}
            >
              <div className="text-xs text-slate-400 mb-1">
                {message.role === "user" ? "You" : "AI Assistant"}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing || !currentModel}
            placeholder={
              currentModel
                ? "Ask a question or request code help..."
                : "Load a model first to use AI assistance"
            }
            className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded"
          />
          <button
            type="submit"
            disabled={isProcessing || !prompt.trim() || !currentModel}
            className={`px-4 py-2 rounded ${
              isProcessing || !prompt.trim() || !currentModel
                ? "bg-slate-800 text-slate-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isProcessing ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
