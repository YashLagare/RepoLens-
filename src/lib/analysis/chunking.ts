import path from "path";
import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";
import TypeScript from "tree-sitter-typescript";

export type CodeChunkDraft = {
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
};

const TARGET_MIN_TOKENS = 200;
const TARGET_MAX_TOKENS = 400;
const OVERLAP_TOKENS = 50;

const CHUNK_NODE_TYPES = new Set([
  "function_declaration",
  "generator_function_declaration",
  "class_declaration",
  "abstract_class_declaration",
  "method_definition",
  "interface_declaration",
  "type_alias_declaration",
  "enum_declaration",
  "lexical_declaration",
  "variable_declaration",
  "export_statement",
  "expression_statement",
]);

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function getLanguage(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".tsx") return TypeScript.tsx;
  if (ext === ".ts") return TypeScript.typescript;
  return JavaScript;
}

function splitOversized(
  filePath: string,
  content: string,
  startLine: number,
): CodeChunkDraft[] {
  const chunks: CodeChunkDraft[] = [];
  const maxChars = TARGET_MAX_TOKENS * 4;
  const overlapChars = OVERLAP_TOKENS * 4;

  let index = 0;
  let lineOffset = 0;

  while (index < content.length) {
    const end = Math.min(content.length, index + maxChars);
    const slice = content.slice(index, end);
    const sliceLines = slice.split("\n");
    const chunkStartLine = startLine + lineOffset;
    const chunkEndLine = chunkStartLine + sliceLines.length - 1;

    chunks.push({
      filePath,
      content: slice.trimEnd(),
      startLine: chunkStartLine,
      endLine: chunkEndLine,
    });

    if (end >= content.length) break;

    const nextIndex = Math.max(index + 1, end - overlapChars);
    const advanced = content.slice(index, nextIndex);
    lineOffset += advanced.split("\n").length - 1;
    index = nextIndex;
  }

  return chunks.filter((chunk) => chunk.content.trim().length > 0);
}

function collectNodes(root: Parser.SyntaxNode): Parser.SyntaxNode[] {
  const results: Parser.SyntaxNode[] = [];

  function visit(node: Parser.SyntaxNode, depth: number) {
    if (CHUNK_NODE_TYPES.has(node.type)) {
      // Prefer the inner declaration for export wrappers when possible
      if (node.type === "export_statement") {
        const inner =
          node.namedChildren.find((child) =>
            CHUNK_NODE_TYPES.has(child.type),
          ) ?? null;
        if (inner) {
          visit(inner, depth + 1);
          return;
        }
      }

      results.push(node);

      // Also chunk methods inside classes separately
      if (
        node.type === "class_declaration" ||
        node.type === "abstract_class_declaration"
      ) {
        for (const child of node.namedChildren) {
          if (child.type === "class_body") {
            for (const member of child.namedChildren) {
              if (member.type === "method_definition") {
                results.push(member);
              }
            }
          }
        }
      }
      return;
    }

    if (depth < 4) {
      for (const child of node.namedChildren) {
        visit(child, depth + 1);
      }
    }
  }

  visit(root, 0);
  return results;
}

function dedupeNodes(nodes: Parser.SyntaxNode[]): Parser.SyntaxNode[] {
  const seen = new Set<string>();
  const output: Parser.SyntaxNode[] = [];

  for (const node of nodes) {
    const key = `${node.startIndex}:${node.endIndex}:${node.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(node);
  }

  return output.sort((a, b) => a.startIndex - b.startIndex);
}

/** Chunk a single source file using Tree-sitter AST boundaries. */
export function chunkSourceFile(
  filePath: string,
  source: string,
): CodeChunkDraft[] {
  if (!source.trim()) return [];

  const parser = new Parser();
  parser.setLanguage(getLanguage(filePath));
  const tree = parser.parse(source);
  const nodes = dedupeNodes(collectNodes(tree.rootNode));

  if (nodes.length === 0) {
    // Fallback: whole file (or split if huge)
    if (estimateTokens(source) > TARGET_MAX_TOKENS) {
      return splitOversized(filePath, source, 1);
    }
    return [
      {
        filePath,
        content: source,
        startLine: 1,
        endLine: source.split("\n").length,
      },
    ];
  }

  const drafts: CodeChunkDraft[] = [];

  for (const node of nodes) {
    const content = source.slice(node.startIndex, node.endIndex).trim();
    if (!content) continue;

    const startLine = node.startPosition.row + 1;
    const endLine = node.endPosition.row + 1;
    const tokens = estimateTokens(content);

    if (tokens > TARGET_MAX_TOKENS) {
      drafts.push(...splitOversized(filePath, content, startLine));
      continue;
    }

    // Skip tiny noise (very small declarations), unless nothing else exists
    if (tokens < 20 && node.type === "expression_statement") continue;

    drafts.push({ filePath, content, startLine, endLine });
  }

  // Merge adjacent tiny chunks toward the 200-token target when cheap
  return mergeSmallChunks(drafts);
}

function mergeSmallChunks(chunks: CodeChunkDraft[]): CodeChunkDraft[] {
  if (chunks.length <= 1) return chunks;

  const merged: CodeChunkDraft[] = [];
  let current: CodeChunkDraft | null = null;

  for (const chunk of chunks) {
    if (!current) {
      current = { ...chunk };
      continue;
    }

    const sameFile = current.filePath === chunk.filePath;
    const combined: string = `${current.content}\n\n${chunk.content}`;
    const combinedTokens = estimateTokens(combined);

    if (
      sameFile &&
      estimateTokens(current.content) < TARGET_MIN_TOKENS &&
      combinedTokens <= TARGET_MAX_TOKENS
    ) {
      current = {
        filePath: current.filePath,
        content: combined,
        startLine: current.startLine,
        endLine: chunk.endLine,
      };
    } else {
      merged.push(current);
      current = { ...chunk };
    }
  }

  if (current) merged.push(current);
  return merged;
}

export const MAX_PROJECT_CHUNKS = 75;

/**
 * Score files by architectural relevance to ensure initial analysis focuses
 * on high-signal application code (pages, components, api, lib).
 */
export function getFileRelevanceScore(filePath: string): number {
  const norm = filePath.toLowerCase().replace(/\\/g, "/");

  // Exclude or severely deprioritize tests, mocks, stories, configs, and declarations
  if (
    norm.includes(".test.") ||
    norm.includes(".spec.") ||
    norm.includes("__tests__/") ||
    norm.includes("__mocks__/") ||
    norm.includes("/tests/") ||
    norm.includes("/test/") ||
    norm.includes("/e2e/") ||
    norm.endsWith(".d.ts") ||
    norm.includes(".stories.") ||
    norm.includes(".config.") ||
    norm.includes(".eslintrc")
  ) {
    return 0;
  }

  // Tier 1 (Highest signal): Pages, App router, API routes, Controllers
  if (
    norm.startsWith("src/app/") ||
    norm.startsWith("app/") ||
    norm.startsWith("src/pages/") ||
    norm.startsWith("pages/") ||
    norm.startsWith("src/routes/") ||
    norm.startsWith("routes/") ||
    norm.includes("/api/") ||
    norm.startsWith("api/") ||
    norm.includes("/controllers/")
  ) {
    return 100;
  }

  // Tier 2: Core library, business logic, components, services
  if (
    norm.startsWith("src/lib/") ||
    norm.startsWith("lib/") ||
    norm.startsWith("src/components/") ||
    norm.startsWith("components/") ||
    norm.startsWith("src/services/") ||
    norm.startsWith("services/") ||
    norm.startsWith("src/server/") ||
    norm.startsWith("server/")
  ) {
    return 80;
  }

  // Tier 3: Hooks, utils, models, store, context, actions
  if (
    norm.includes("/hooks/") ||
    norm.includes("/utils/") ||
    norm.includes("/models/") ||
    norm.includes("/store/") ||
    norm.includes("/context/") ||
    norm.includes("/actions/")
  ) {
    return 60;
  }

  // Tier 4: Other src files
  if (norm.startsWith("src/")) {
    return 40;
  }

  // Tier 5: Root source files
  if (!norm.includes("/")) {
    return 50;
  }

  return 20;
}

/** Chunk provided source files, prioritizing high-signal files and capping at maxChunks. */
export function chunkProjectFiles(
  files: { relativePath: string; content: string }[],
  maxChunks: number = MAX_PROJECT_CHUNKS,
): CodeChunkDraft[] {
  if (files.length === 0 || maxChunks <= 0) return [];

  // Filter out low-signal/test files first
  const highSignalFiles = files.filter(
    (file) => getFileRelevanceScore(file.relativePath) > 0,
  );

  // If all files were filtered (e.g. non-standard repo structure), fall back to original files
  const candidateFiles =
    highSignalFiles.length > 0 ? highSignalFiles : files;

  // Sort files by relevance score descending, then by shorter path
  const sortedFiles = [...candidateFiles].sort((a, b) => {
    const scoreDiff =
      getFileRelevanceScore(b.relativePath) -
      getFileRelevanceScore(a.relativePath);
    if (scoreDiff !== 0) return scoreDiff;
    return a.relativePath.length - b.relativePath.length;
  });

  const all: CodeChunkDraft[] = [];

  for (const file of sortedFiles) {
    if (all.length >= maxChunks) break;

    const fileChunks = chunkSourceFile(file.relativePath, file.content);
    if (fileChunks.length === 0) continue;

    const remainingBudget = maxChunks - all.length;
    if (fileChunks.length <= remainingBudget) {
      all.push(...fileChunks);
    } else {
      all.push(...fileChunks.slice(0, remainingBudget));
      break;
    }
  }

  return all;
}
