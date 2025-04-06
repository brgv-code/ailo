"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { spawn } from "child_process";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

const PROJECT_TEMPLATES = {
  nextjs: {
    name: "Next.js",
    command: "echo 'Creating Next.js project...'",
    postCommands: [],
  },
  nuxtjs: {
    name: "Nuxt.js",
    command: "npx nuxi init",
    postCommands: ["npm install"],
  },
  react: {
    name: "React (Vite)",
    command: "npm create vite@latest . -- --template react-ts",
    postCommands: ["npm install"],
  },
  vue: {
    name: "Vue.js (Vite)",
    command: "npm create vite@latest . -- --template vue-ts",
    postCommands: ["npm install"],
  },
  svelte: {
    name: "Svelte Kit",
    command: "npm create svelte@latest .",
    postCommands: ["npm install"],
  },
  express: {
    name: "Express.js",
    command:
      "npm init -y && npm install express typescript ts-node @types/node @types/express",
    postCommands: [],
  },
  "python-flask": {
    name: "Python Flask",
    command:
      "mkdir -p app && touch app/__init__.py app/routes.py requirements.txt",
    postCommands: [],
  },
  "python-django": {
    name: "Python Django",
    command: "pip install django && django-admin startproject config .",
    postCommands: [],
  },
};

export type ProjectTemplate = {
  name: string;
  command: string;
  postCommands: string[];
};

async function ensureProjectsDir() {
  try {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create projects directory:", error);
  }
}

ensureProjectsDir();

export async function getProjects(): Promise<string[]> {
  try {
    const dirs = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    return dirs
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

export async function createProject(name: string): Promise<boolean> {
  try {
    const projectPath = path.join(PROJECTS_DIR, name);
    await fs.mkdir(projectPath, { recursive: true });
    await fs.writeFile(
      path.join(projectPath, "README.md"),
      `# ${name}\n\nWelcome to your new project.`
    );
    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Error creating project:", error);
    return false;
  }
}

async function executeCommand(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
    const shellArgs = process.platform === "win32" ? ["-Command"] : ["-c"];

    const child = spawn(shell, [...shellArgs, command], {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

export async function createProjectFromTemplate(
  name: string,
  templateId: string
): Promise<boolean> {
  const template =
    PROJECT_TEMPLATES[templateId as keyof typeof PROJECT_TEMPLATES];
  if (!template) {
    throw new Error(`Template "${templateId}" not found`);
  }

  try {
    const projectPath = path.join(PROJECTS_DIR, name);

    await fs.mkdir(projectPath, { recursive: true });

    await executeCommand(template.command, projectPath);

    if (templateId === "nextjs") {
      await fs.mkdir(path.join(projectPath, "pages"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "public"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "styles"), { recursive: true });

      const packageJson = {
        name: name,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "^13.0.0",
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
      };

      await fs.writeFile(
        path.join(projectPath, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      const indexJs = `
import React from 'react';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <p>This is a basic Next.js starter template.</p>
    </div>
  );
}
`;
      await fs.writeFile(path.join(projectPath, "pages", "index.js"), indexJs);

      const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;
      await fs.writeFile(path.join(projectPath, "next.config.js"), nextConfig);
    }

    for (const cmd of template.postCommands) {
      await executeCommand(cmd, projectPath);
    }

    revalidatePath("/");
    return true;
  } catch (error) {
    console.error(`Error creating project from template ${templateId}:`, error);
    return false;
  }
}

export async function cloneGitRepository(
  name: string,
  repoUrl: string,
  branch?: string
): Promise<boolean> {
  try {
    const projectPath = path.join(PROJECTS_DIR, name);

    try {
      await fs.access(projectPath);
      throw new Error(`Project directory already exists: ${name}`);
    } catch {}

    await fs.mkdir(projectPath, { recursive: true });

    const branchArg = branch ? `--branch ${branch}` : "";
    await executeCommand(`git clone ${branchArg} ${repoUrl} .`, projectPath);

    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Error cloning repository:", error);
    return false;
  }
}

export async function getProjectFiles(projectName: string): Promise<string[]> {
  const projectPath = path.join(PROJECTS_DIR, projectName);

  try {
    const files = await walkDir(projectPath);
    return files.map((file) => path.relative(projectPath, file));
  } catch (error) {
    console.error(`Error reading project ${projectName}:`, error);
    return [];
  }
}

async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      files.push(...(await walkDir(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

export async function readFileAction(
  projectName: string,
  filePath: string
): Promise<string> {
  try {
    const fullPath = path.join(PROJECTS_DIR, projectName, filePath);
    return await fs.readFile(fullPath, "utf-8");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw new Error(`Failed to read file: ${filePath}`);
  }
}

export async function writeFileAction(
  projectName: string,
  filePath: string,
  content: string
): Promise<void> {
  try {
    const fullPath = path.join(PROJECTS_DIR, projectName, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw new Error(`Failed to write file: ${filePath}`);
  }
}

export async function createFileAction(
  projectName: string,
  filePath: string,
  content: string = ""
): Promise<void> {
  try {
    const fullPath = path.join(PROJECTS_DIR, projectName, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    try {
      await fs.access(fullPath);
      throw new Error(`File already exists: ${filePath}`);
    } catch {
      await fs.writeFile(fullPath, content);
    }
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
    throw error;
  }
}

export async function deleteFileAction(
  projectName: string,
  filePath: string
): Promise<void> {
  try {
    const fullPath = path.join(PROJECTS_DIR, projectName, filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    throw new Error(`Failed to delete file: ${filePath}`);
  }
}

export async function getAvailableTemplates(): Promise<
  { id: string; name: string }[]
> {
  return Object.entries(PROJECT_TEMPLATES).map(([id, template]) => ({
    id,
    name: template.name,
  }));
}
