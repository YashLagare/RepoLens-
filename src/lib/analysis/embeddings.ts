import { env, pipeline } from "@xenova/transformers";

// Run fully from the Hugging Face hub cache; no local model path required.
env.allowLocalModels = false;

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
 * Fast local MiniLM embeddings on serverless CPU.
 * Batches inputs and uses single tensor inference for maximum speed.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

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

