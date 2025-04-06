"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

export type ModelType = "local" | "anthropic" | "openai";

interface ModelConfig {
  type: ModelType;
  name: string;
}

interface ApiKeys {
  anthropic?: string;
  openai?: string;
}

interface ModelContextType {
  currentModel: string | null;
  modelType: ModelType;
  modelConfig: ModelConfig | null;
  availableModels: string[];
  loadModel: (modelName: string) => Promise<void>;
  generateResponse: (prompt: string) => Promise<string>;
  fetchAvailableLocalModels: () => Promise<void>;
  setApiKey: (modelType: ModelType, apiKey: string) => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>("local");
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});

  useEffect(() => {
    const savedKeys = localStorage.getItem("model_api_keys");
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys) as ApiKeys;
        setApiKeys(keys);
      } catch (error) {
        console.error("Failed to parse saved API keys:", error);
      }
    }

    const lastModel = localStorage.getItem("last_model");
    if (lastModel) {
      try {
        const config = JSON.parse(lastModel) as ModelConfig;
        setModelType(config.type);
        setModelConfig(config);
        setCurrentModel(config.name);
      } catch (error) {
        console.error("Failed to load last used model:", error);
      }
    }

    fetchAvailableLocalModels();
  }, []);

  useEffect(() => {
    if (Object.keys(apiKeys).length > 0) {
      localStorage.setItem("model_api_keys", JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  const setApiKey = async (type: ModelType, key: string) => {
    setApiKeys((prev) => ({ ...prev, [type]: key }));
  };

  const fetchAvailableLocalModels = async () => {
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      const data = await response.json();

      if (data && data.models) {
        const models = data.models.map((model: { name: string }) => model.name);
        setAvailableModels(models);
      }
    } catch (error) {
      console.error("Failed to fetch models from Ollama:", error);
      setAvailableModels([]);
    }
  };

  const checkModelExists = async (modelName: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      const data = await response.json();

      if (data && data.models) {
        return data.models.some(
          (model: { name: string }) => model.name === modelName
        );
      }
      return false;
    } catch (error) {
      console.error("Failed to check model existence:", error);
      return false;
    }
  };

  const pullModel = async (modelName: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:11434/api/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to pull model:", error);
      throw error;
    }
  };

  const loadModel = async (modelName: string) => {
    try {
      let newModelType: ModelType = "local";

      if (modelName.startsWith("claude")) {
        newModelType = "anthropic";
        if (!apiKeys.anthropic) {
          throw new Error(
            "Anthropic API key is not set. Please set an API key first."
          );
        }
      } else if (modelName.startsWith("gpt")) {
        newModelType = "openai";
        if (!apiKeys.openai) {
          throw new Error(
            "OpenAI API key is not set. Please set an API key first."
          );
        }
      } else {
        const exists = await checkModelExists(modelName);
        if (!exists) {
          await pullModel(modelName);
        }
      }

      const config: ModelConfig = { type: newModelType, name: modelName };
      localStorage.setItem("last_model", JSON.stringify(config));

      setModelType(newModelType);
      setModelConfig(config);
      setCurrentModel(modelName);
    } catch (error) {
      console.error("Failed to load model:", error);
      throw error;
    }
  };

  const generateResponse = async (prompt: string): Promise<string> => {
    if (!currentModel) {
      throw new Error("No model is loaded. Please load a model first.");
    }

    try {
      if (modelType === "local") {
        const response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: currentModel,
            prompt: prompt,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || "No response from model.";
      } else if (modelType === "anthropic") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKeys.anthropic || "",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: currentModel,
            max_tokens: 4000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Anthropic API error: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        return data.content?.[0]?.text || "No response from Claude.";
      } else if (modelType === "openai") {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKeys.openai || ""}`,
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 4000,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response from model.";
      }

      throw new Error(`Unsupported model type: ${modelType}`);
    } catch (error) {
      console.error("Failed to generate response:", error);
      throw error;
    }
  };

  return (
    <ModelContext.Provider
      value={{
        currentModel,
        modelType,
        modelConfig,
        availableModels,
        loadModel,
        generateResponse,
        fetchAvailableLocalModels,
        setApiKey,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};
