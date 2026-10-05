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

    if (files.length > 0) return files;
  } catch {
    // Disk cache missed in this serverless container — fall through to database/GitHub
  }

  // Fallback: Fetch directly from GitHub for serverless execution
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { user: { select: { githubAccessToken: true } } },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.source === "github" && project.user.githubAccessToken) {
    const fullName = githubFullName(project);
    if (!fullName) {
      throw new Error("Could not determine GitHub repository name.");
    }

    const zipBuffer = await downloadGitHubZipball(
      project.user.githubAccessToken,
      fullName,
    );

    const extracted = await extractFromZipBuffer(zipBuffer, { stripRoot: true });
    if (!extracted.ok) {
      throw new Error(extracted.error);
    }

    // Cache locally for the rest of this execution lifecycle
    await persistProjectFiles(projectId, extracted.sourceFiles);

    return extracted.sourceFiles
      .filter((file) => isSourceFile(file.relativePath))
      .map((file) => ({
        relativePath: file.relativePath,
        content: file.content,
      }));
  }

  throw new Error("No source files found to analyze. Please re-import the project.");
}
