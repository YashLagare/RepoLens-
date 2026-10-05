// import type { ExtractedFile } from "@/lib/files/filters";
// import { mkdir, readFile, rm, writeFile } from "fs/promises";
// import path from "path";

// const DATA_ROOT = path.join(process.cwd(), ".data", "projects");

// export type ProjectManifestEntry = {
//   relativePath: string;
//   sizeBytes: number;
// };

// export function getProjectDataDir(projectId: string): string {
//   return path.join(DATA_ROOT, projectId);
// }

// export async function persistProjectFiles(
//   projectId: string,
//   files: ExtractedFile[],
// ): Promise<void> {
//   const root = getProjectDataDir(projectId);
//   await mkdir(root, { recursive: true });

//   const manifest: ProjectManifestEntry[] = files.map((file) => ({
//     relativePath: file.relativePath,
//     sizeBytes: file.sizeBytes,
//   }));

//   await writeFile(
//     path.join(root, "manifest.json"),
//     JSON.stringify(manifest, null, 2),
//     "utf8",
//   );

//   for (const file of files) {
//     const target = path.join(root, "files", file.relativePath);
//     await mkdir(path.dirname(target), { recursive: true });
//     await writeFile(target, file.content, "utf8");
//   }
// }

// export async function readProjectManifest(
//   projectId: string,
// ): Promise<ProjectManifestEntry[]> {
//   const raw = await readFile(
//     path.join(getProjectDataDir(projectId), "manifest.json"),
//     "utf8",
//   );
//   return JSON.parse(raw) as ProjectManifestEntry[];
// }

// export async function deleteProjectFiles(projectId: string): Promise<void> {
//   await rm(getProjectDataDir(projectId), { recursive: true, force: true });
// }



import fs from "fs/promises";
import os from "os";
import path from "path";

export type StoredSourceFile = {
  relativePath: string;
  content: string;
};

// Use os.tmpdir() in serverless (Vercel) where root is read-only, and local .data in development
function getProjectsDir(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), ".data", "projects");
  }
  return path.join(process.cwd(), ".data", "projects");
}

export function getProjectStorageDir(projectId: string): string {
  return path.join(getProjectsDir(), projectId);
}

export async function persistProjectFiles(
  projectId: string,
  files: StoredSourceFile[],
): Promise<void> {
  const projectDir = getProjectStorageDir(projectId);
  await fs.mkdir(projectDir, { recursive: true });

  await Promise.all(
    files.map(async (file) => {
      const destination = path.join(projectDir, file.relativePath);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, file.content, "utf-8");
    }),
  );
}

export async function loadProjectFile(
  projectId: string,
  relativePath: string,
): Promise<string | null> {
  const filePath = path.join(getProjectStorageDir(projectId), relativePath);
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function deleteProjectFiles(projectId: string): Promise<void> {
  const projectDir = getProjectStorageDir(projectId);
  try {
    await fs.rm(projectDir, { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
}
