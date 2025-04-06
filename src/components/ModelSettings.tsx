"use client";

import { useState, useEffect } from "react";
import { useModel } from "@/context/ModelContext";

interface ModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelSettings({ isOpen, onClose }: ModelSettingsProps) {
  const { availableModels, currentModel, loadModel, setApiKey } = useModel();

  const [selectedModel, setSelectedModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [modelType, setModelType] = useState<"local" | "anthropic" | "openai">(
    "local"
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(currentModel || "");
      setError("");
      setSuccess("");
    }
  }, [isOpen, currentModel]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (modelType === "anthropic" && anthropicKey) {
        await setApiKey("anthropic", anthropicKey);
        setSuccess("Anthropic API key saved");
      } else if (modelType === "openai" && openaiKey) {
        await setApiKey("openai", openaiKey);
        setSuccess("OpenAI API key saved");
      }

      if (selectedModel && selectedModel !== currentModel) {
        await loadModel(selectedModel);
        setSuccess(`Model ${selectedModel} loaded successfully`);
      }

      setTimeout(() => onClose(), 1500);
    } catch (err: unknown) {
      console.error("Failed to load model:", err);
      setError(err instanceof Error ? err.message : "Failed to load model");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Model Settings</h2>

        <div className="mb-4">
          <p className="mb-2 font-medium">Model Type</p>
          <div className="flex space-x-3">
            <button
              type="button"
              className={`px-3 py-1 rounded ${
                modelType === "local" ? "bg-blue-600" : "bg-slate-700"
              }`}
              onClick={() => setModelType("local")}
            >
              Local (Ollama)
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded ${
                modelType === "anthropic" ? "bg-blue-600" : "bg-slate-700"
              }`}
              onClick={() => setModelType("anthropic")}
            >
              Anthropic
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded ${
                modelType === "openai" ? "bg-blue-600" : "bg-slate-700"
              }`}
              onClick={() => setModelType("openai")}
            >
              OpenAI
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {modelType === "local" && (
            <div className="mb-4">
              <label className="block mb-1">Select Model</label>
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full px-3 py-2 bg-slate-700 rounded"
              >
                <option value="">Select a model</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400">
                These are models available through Ollama. Make sure Ollama is
                running and you have pulled the models you want to use.
              </p>
            </div>
          )}

          {modelType === "anthropic" && (
            <div className="mb-4">
              <label htmlFor="anthropic-key" className="block mb-1">
                Anthropic API Key
              </label>
              <input
                id="anthropic-key"
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded"
                placeholder="sk-ant-api-key..."
              />
              <p className="mt-2 text-xs text-slate-400">
                Enter your Anthropic API key to use Claude models. Your key is
                stored only in your browser.
              </p>
              <div className="mt-2">
                <label className="block mb-1">Model</label>
                <select
                  value={selectedModel}
                  onChange={handleModelChange}
                  className="w-full px-3 py-2 bg-slate-700 rounded"
                >
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-sonnet-20240229">
                    Claude 3 Sonnet
                  </option>
                  <option value="claude-3-haiku-20240307">
                    Claude 3 Haiku
                  </option>
                </select>
              </div>
            </div>
          )}

          {modelType === "openai" && (
            <div className="mb-4">
              <label htmlFor="openai-key" className="block mb-1">
                OpenAI API Key
              </label>
              <input
                id="openai-key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded"
                placeholder="sk-openai-key..."
              />
              <p className="mt-2 text-xs text-slate-400">
                Enter your OpenAI API key to use GPT models. Your key is stored
                only in your browser.
              </p>
              <div className="mt-2">
                <label className="block mb-1">Model</label>
                <select
                  value={selectedModel}
                  onChange={handleModelChange}
                  className="w-full px-3 py-2 bg-slate-700 rounded"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-2 bg-green-900/30 border border-green-700 rounded text-green-400">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
