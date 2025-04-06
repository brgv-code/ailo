"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Terminal() {
  const [history, setHistory] = useState<string[]>([
    "DIY Cursor Terminal v0.1.0",
    "Type 'help' for available commands",
    "",
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };

    terminalRef.current?.addEventListener("click", handleClick);
    return () => {
      terminalRef.current?.removeEventListener("click", handleClick);
    };
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const newHistory = [...history, `$ ${input}`];

    const command = input.trim().toLowerCase();
    let response: string | string[] = "";

    switch (command) {
      case "help":
        response = [
          "Available commands:",
          "  help     - Display this help message",
          "  clear    - Clear the terminal",
          "  version  - Show terminal version",
          "  ls       - List files (simulated)",
          "  echo     - Echo text back to terminal",
        ];
        break;
      case "clear":
        setHistory([]);
        setInput("");
        return;
      case "version":
        response = "DIY Cursor Terminal v0.1.0";
        break;
      case "ls":
        response = ["package.json", "node_modules/", "src/", "public/"];
        break;
      default:
        if (command.startsWith("echo ")) {
          response = command.substring(5);
        } else {
          response = `Command not found: ${command}`;
        }
    }

    if (Array.isArray(response)) {
      setHistory([...newHistory, ...response, ""]);
    } else {
      setHistory([...newHistory, response, ""]);
    }

    setInput("");
  };

  return (
    <div
      ref={terminalRef}
      className="h-full flex flex-col bg-black font-mono text-sm p-2 overflow-hidden"
    >
      <div className="p-1 border-b border-zinc-800 mb-2">
        <h2 className="text-sm font-bold">Terminal</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {history.map((line, index) => (
          <pre key={index} className="text-green-400 whitespace-pre-wrap">
            {line}
          </pre>
        ))}
        <form onSubmit={handleCommand} className="flex">
          <span className="text-green-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-green-400 focus:outline-none"
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
