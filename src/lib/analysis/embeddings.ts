import { env, pipeline } from "@xenova/transformers";
import os from "os";
import path from "path";

// In serverless environments, root is read-only. Ensure Hugging Face writes to /tmp.
env.allowLocalModels = false;
try {
  env.cacheDir = path.join(os.tmpdir(), ".transformers-cache");
} catch {
  // Ignore fallback if os.tmpdir() fails
}

export const EMBEDDING_DIMENSIONS = 384;
const BATCH_SIZE = 24;
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

type EmbeddingOutput = {
  data: Float32Array | number[];
  dims?: number[];
  tolist?: () => number[] | number[][];
};

type FeatureExtractor = (
  text: string | string[],
  options: { pooling: "mean"; normalize: boolean },
) => Promise<EmbeddingOutput>;

let extractorPromise: Promise<FeatureExtractor> | null = null;

async function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      MODEL_ID,
    ) as Promise<FeatureExtractor>;
  }
  return extractorPromise;
}

/** Convert an embedding array into a pgvector literal. */
export function toVectorLiteral(embedding: number[]): string {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS}-dimension embedding, got ${embedding.length}`,
    );
  }
  return `[${embedding.join(",")}]`;
}

function toNumberArray(data: Float32Array | number[]): number[] {
  return Array.from(data);
}

/**
 * Fast cloud embedding via OpenRouter (OpenAI text-embedding-3-small truncated to 384 dimensions).
 * Runs in ~300ms on serverless without downloading 90MB ONNX models or exceeding container limits.
 */
async function embedTextsViaOpenRouter(texts: string[]): Promise<number[][] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: texts.map((t) => (t.length > 3000 ? t.slice(0, 3000) : t)),
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!res.ok) {
      console.warn("OpenRouter embedding request failed, falling back to local:", await res.text());
      return null;
    }

    const json = (await res.json()) as {
      data?: Array<{ embedding: number[] }>;
    };

    if (Array.isArray(json?.data) && json.data.length === texts.length) {
      return json.data.map((item) => item.embedding);
    }
  } catch (err) {
    console.warn("OpenRouter embedding error, falling back to local:", err);
  }
  return null;
}

/**
 * High-performance embeddings for serverless environments.
 * Uses OpenRouter cloud embeddings first (sub-second, zero disk overhead),
 * with local MiniLM ONNX as a reliable fallback.
 */
export async function embedTexts(
  texts: string[],
  onBatch?: (completed: number, total: number) => Promise<void> | void,
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // 1. Fast Path: OpenRouter Cloud Embeddings (sub-second, no cold-start model download)
  const cloudEmbeddings = await embedTextsViaOpenRouter(texts);
  if (cloudEmbeddings) {
    if (onBatch) {
      await onBatch(texts.length, texts.length);
    }
    return cloudEmbeddings;
  }

  // 2. Fallback Path: Local MiniLM transformer model
  const extractor = await getExtractor();
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const rawBatch = texts.slice(i, i + BATCH_SIZE);
    // Truncate to reasonable length to speed up tokenization
    const batch = rawBatch.map((text) =>
      text.length > 2500 ? text.slice(0, 2500) : text,
    );

    try {
      // Pass the entire batch array directly to transformers.js
      const output = await extractor(batch, {
        pooling: "mean",
        normalize: true,
      });

      if (output && typeof output.tolist === "function") {
        const list = output.tolist();
        if (Array.isArray(list) && list.length > 0) {
          if (typeof list[0] === "number") {
            results.push(list as number[]);
          } else {
            results.push(...(list as number[][]));
          }
          if (onBatch) {
            await onBatch(results.length, texts.length);
          }
          continue;
        }
      }

      if (output?.data) {
        const rawData = output.data as Float32Array;
        for (let b = 0; b < batch.length; b++) {
          const start = b * EMBEDDING_DIMENSIONS;
          const slice = Array.from(
            rawData.subarray(start, start + EMBEDDING_DIMENSIONS),
          );
          if (slice.length === EMBEDDING_DIMENSIONS) {
            results.push(slice);
          }
        }
        continue;
      }
    } catch {
      // Fallback to Promise.all if batched array inference is not supported
    }

    const embedded = await Promise.all(
      batch.map(async (text) => {
        const output = await extractor(text, {
          pooling: "mean",
          normalize: true,
        });
        const values = toNumberArray(output.data);
        if (values.length !== EMBEDDING_DIMENSIONS) {
          throw new Error(
            `Unexpected embedding size ${values.length}; expected ${EMBEDDING_DIMENSIONS}`,
          );
        }
        return values;
      }),
    );
    results.push(...embedded);
  }

  return results;
}

/** Embed a single query string for similarity search. */
export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  if (!embedding) {
    throw new Error("Failed to generate embedding for query");
  }
  return embedding;
}

