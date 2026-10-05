import { chunkProjectFiles, chunkSourceFile, MAX_PROJECT_CHUNKS } from "@/lib/analysis/chunking";
import { describe, expect, it } from "vitest";

describe("chunking optimization", () => {
  it("prioritizes pages, components, api, and lib over test and config files", () => {
    const files = [
      { relativePath: "src/utils/math.test.ts", content: "test('math', () => {});" },
      { relativePath: "src/lib/auth.ts", content: "export function authenticate() { return true; }" },
      { relativePath: "src/components/button.tsx", content: "export function Button() { return <button>Click</button>; }" },
      { relativePath: "src/app/api/users/route.ts", content: "export async function GET() { return Response.json([]); }" },
      { relativePath: "jest.config.ts", content: "export default {};" },
    ];

    const chunks = chunkProjectFiles(files, 50);
    expect(chunks.length).toBeGreaterThan(0);

    const chunkPaths = chunks.map((c) => c.filePath);
    // API, components, and lib should be chunked
    expect(chunkPaths.some((p) => p.includes("api/users"))).toBe(true);
    expect(chunkPaths.some((p) => p.includes("components/button"))).toBe(true);
    expect(chunkPaths.some((p) => p.includes("lib/auth"))).toBe(true);
    // Test and config should be skipped or deprioritized
    expect(chunkPaths.some((p) => p.includes(".test.ts"))).toBe(false);
    expect(chunkPaths.some((p) => p.includes("jest.config"))).toBe(false);
  });

  it("caps total indexed chunks per project to MAX_PROJECT_CHUNKS", () => {
    // Generate 120 files
    const files = Array.from({ length: 120 }, (_, i) => ({
      relativePath: `src/components/comp${i}.tsx`,
      content: `export function Comp${i}() {\n  const x = ${i};\n  return <div>{x}</div>;\n}`,
    }));

    const chunks = chunkProjectFiles(files, 60);
    expect(chunks.length).toBeLessThanOrEqual(60);
  });
});
