// import { isSourceFile } from "@/lib/files/filters";
// import {
//   getProjectDataDir,
//   type ProjectManifestEntry,
// } from "@/lib/files/storage";
// import { readFile } from "fs/promises";
// import path from "path";

// export type ProjectSourceFile = {
//   relativePath: string;
//   content: string;
// };

// /** Load extracted JS/TS source files for a project from disk. */
// export async function loadProjectSourceFiles(
//   projectId: string,
// ): Promise<ProjectSourceFile[]> {
//   const root = getProjectDataDir(projectId);
//   const manifestRaw = await readFile(path.join(root, "manifest.json"), "utf8");
//   const manifest = JSON.parse(manifestRaw) as ProjectManifestEntry[];

//   const files: ProjectSourceFile[] = [];

//   for (const entry of manifest) {
//     if (!isSourceFile(entry.relativePath)) continue;
//     const content = await readFile(
//       path.join(root, "files", entry.relativePath),
//       "utf8",
//     );
//     files.push({ relativePath: entry.relativePath, content });
//   }

//   return files;
// }



import { prisma } from "@/lib/db";
import { extractFromZipBuffer } from "@/lib/files/extract";
import { isSourceFile } from "@/lib/files/filters";
import {
  getProjectDataDir,
  persistProjectFiles,
  type ProjectManifestEntry,
} from "@/lib/files/storage";
import { downloadGitHubZipball } from "@/lib/github";
import { readFile } from "fs/promises";
import path from "path";

export type ProjectSourceFile = {
  relativePath: string;
  content: string;
};

const memoryFileCache = new Map<string, { files: ProjectSourceFile[]; timestamp: number }>();

function githubFullName(project: {
  name: string;
  repositoryUrl: string | null;
}): string | null {
  if (project.name.includes("/")) return project.name;
  const match = project.repositoryUrl?.match(/github\.com\/([^/]+\/[^/#?]+)/i);
  return match?.[1]?.replace(/\.git$/i, "") ?? null;
}

/** Load extracted JS/TS source files for a project, with auto-fetch fallback for serverless. */
export async function loadProjectSourceFiles(
  projectId: string,
): Promise<ProjectSourceFile[]> {
  const cached = memoryFileCache.get(projectId);
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return cached.files;
  }

  const root = getProjectDataDir(projectId);

  try {
    const manifestRaw = await readFile(
      path.join(root, "manifest.json"),
      "utf8",
    );
    const manifest = JSON.parse(manifestRaw) as ProjectManifestEntry[];

    const files: ProjectSourceFile[] = [];
    for (const entry of manifest) {
      if (!isSourceFile(entry.relativePath)) continue;
      const content = await readFile(
        path.join(root, "files", entry.relativePath),
        "utf8",
      );
      files.push({ relativePath: entry.relativePath, content });
    }

    if (files.length > 0) {
      memoryFileCache.set(projectId, { files, timestamp: Date.now() });
      return files;
    }
  } catch {
    // Disk cache missed in this serverless container — fall through to database/GitHub
  }

  // Fallback: Fetch directly from GitHub for serverless execution
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: {
        select: {
          githubAccessToken: true,
          accounts: {
            where: { provider: "github" },
            select: { access_token: true },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const githubToken =
    project.user.githubAccessToken ||
    project.user.accounts?.[0]?.access_token;

  if (project.source === "github" && githubToken) {
    const fullName = githubFullName(project);
    if (!fullName) {
      throw new Error("Could not determine GitHub repository name.");
    }

    const zipBuffer = await downloadGitHubZipball(
      githubToken,
      fullName,
    );

    const extracted = await extractFromZipBuffer(zipBuffer, { stripRoot: true });
    if (!extracted.ok) {
      throw new Error(extracted.error);
    }

    // Cache locally for the rest of this execution lifecycle
    await persistProjectFiles(projectId, extracted.sourceFiles);

    const sourceFiles = extracted.sourceFiles
      .filter((file) => isSourceFile(file.relativePath))
      .map((file) => ({
        relativePath: file.relativePath,
        content: file.content,
      }));

    memoryFileCache.set(projectId, { files: sourceFiles, timestamp: Date.now() });
    return sourceFiles;
  }

  throw new Error("No source files found to analyze. Please re-import the project.");
}
