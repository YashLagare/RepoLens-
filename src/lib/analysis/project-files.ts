import { prisma } from "@/lib/db";
import { extractFromZipBuffer } from "@/lib/files/extract";
import { isSourceFile } from "@/lib/files/filters";
import { downloadGitHubZipball } from "@/lib/github";

export type ProjectSourceFile = {
  relativePath: string;
  content: string;
};

// In-memory cache valid for 10 minutes within the same serverless container lifecycle.
// On Vercel each invocation may get a fresh container, so this only helps
// when knowledge + report stages run in the same invocation (auto mode).
const memoryFileCache = new Map<string, { files: ProjectSourceFile[]; timestamp: number }>();

function githubFullName(project: {
  name: string;
  repositoryUrl: string | null;
}): string | null {
  if (project.name.includes("/")) return project.name;
  const match = project.repositoryUrl?.match(/github\.com\/([^/]+\/[^/#?]+)/i);
  return match?.[1]?.replace(/\.git$/i, "") ?? null;
}

/** Load JS/TS source files for a project. Always fetches from GitHub on serverless
 *  (disk cache is unreliable across invocations). Uses in-memory cache within a run. */
export async function loadProjectSourceFiles(
  projectId: string,
): Promise<ProjectSourceFile[]> {
  // 1. Fast path: same-invocation in-memory cache
  const cached = memoryFileCache.get(projectId);
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return cached.files;
  }

  // 2. Fetch the project + tokens from DB
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: {
        select: {
          githubAccessToken: true,          // encrypted via custom GitHub connect flow
          accounts: {
            where: { provider: "github" },
            select: { access_token: true }, // raw token from Auth.js GitHub OAuth
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.source !== "github") {
    throw new Error(
      "Only GitHub-imported projects are supported for analysis. Please re-import the project.",
    );
  }

  // Prefer the custom-connect token (encrypted) over the Auth.js OAuth token (raw)
  const githubToken =
    project.user.githubAccessToken ??
    project.user.accounts?.[0]?.access_token ??
    null;

  if (!githubToken) {
    throw new Error(
      "No GitHub access token found. Please connect your GitHub account in Settings and re-import the project.",
    );
  }

  const fullName = githubFullName(project);
  if (!fullName) {
    throw new Error(
      `Could not determine GitHub repository name from project name "${project.name}". Please re-import.`,
    );
  }

  // 3. Download from GitHub (with automatic fallback to alternative account token if first token fails)
  let zipBuffer: Buffer;
  try {
    zipBuffer = await downloadGitHubZipball(githubToken, fullName);
  } catch (firstErr) {
    const altToken =
      githubToken === project.user.githubAccessToken
        ? project.user.accounts?.[0]?.access_token
        : project.user.githubAccessToken;

    if (altToken && altToken !== githubToken) {
      try {
        zipBuffer = await downloadGitHubZipball(altToken, fullName);
      } catch {
        throw firstErr;
      }
    } else {
      throw firstErr;
    }
  }

  // 4. Extract ZIP
  const extracted = await extractFromZipBuffer(zipBuffer, { stripRoot: true });
  if (!extracted.ok) {
    throw new Error(`Failed to extract repository archive: ${extracted.error}`);
  }

  const sourceFiles = extracted.sourceFiles
    .filter((file) => isSourceFile(file.relativePath))
    .map((file) => ({
      relativePath: file.relativePath,
      content: file.content,
    }));

  if (sourceFiles.length === 0) {
    throw new Error(
      "No JavaScript/TypeScript source files found in the repository.",
    );
  }

  // 5. Cache in memory for subsequent calls within this invocation
  memoryFileCache.set(projectId, { files: sourceFiles, timestamp: Date.now() });
  return sourceFiles;
}
