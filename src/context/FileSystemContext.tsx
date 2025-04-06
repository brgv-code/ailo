"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  getProjectFiles,
  readFileAction,
  writeFileAction,
  createFileAction,
  deleteFileAction,
} from "@/actions/fileActions";

interface FileSystemProviderProps {
  children: React.ReactNode;
  projectName: string;
}

interface FileSystemContextType {
  currentFile: string | null;
  setCurrentFile: (path: string | null) => void;
  fileList: string[];
  createFile: (path: string, content?: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  isFileSystemReady: boolean;
  projectName: string;
  refreshFiles: () => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined
);

export function FileSystemProvider({
  children,
  projectName,
}: FileSystemProviderProps) {
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileList, setFileList] = useState<string[]>([]);
  const [isFileSystemReady, setIsFileSystemReady] = useState(false);

  const refreshFiles = useCallback(async () => {
    try {
      const files = await getProjectFiles(projectName);
      setFileList(files);
    } catch (error) {
      console.error("Error refreshing files:", error);
    }
  }, [projectName]);

  useEffect(() => {
    const initFileSystem = async () => {
      try {
        await refreshFiles();
        setIsFileSystemReady(true);
      } catch (error) {
        console.error("Error initializing file system:", error);
      }
    };

    initFileSystem();
  }, [projectName, refreshFiles]);

  const createFile = useCallback(
    async (path: string, content: string = "") => {
      try {
        await createFileAction(projectName, path, content);

        await refreshFiles();

        setCurrentFile(path);
      } catch (error) {
        console.error("Error creating file:", error);
        throw error;
      }
    },
    [projectName, refreshFiles]
  );

  const readFile = useCallback(
    async (path: string): Promise<string> => {
      try {
        return await readFileAction(projectName, path);
      } catch (error) {
        console.error("Error reading file:", error);
        throw error;
      }
    },
    [projectName]
  );

  const writeFile = useCallback(
    async (path: string, content: string) => {
      try {
        await writeFileAction(projectName, path, content);
      } catch (error) {
        console.error("Error writing file:", error);
        throw error;
      }
    },
    [projectName]
  );

  const deleteFile = useCallback(
    async (path: string) => {
      try {
        await deleteFileAction(projectName, path);

        await refreshFiles();

        if (currentFile === path) {
          setCurrentFile(null);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
      }
    },
    [projectName, currentFile, refreshFiles]
  );

  return (
    <FileSystemContext.Provider
      value={{
        currentFile,
        setCurrentFile,
        fileList,
        createFile,
        readFile,
        writeFile,
        deleteFile,
        isFileSystemReady,
        projectName,
        refreshFiles,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
}
