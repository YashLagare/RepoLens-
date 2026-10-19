import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getLanguageModel() {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Please set OPENROUTER_API_KEY in your environment variables (get a key at https://openrouter.ai/keys).",
    );
  }

  const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
  const modelId =
    process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct";
  return openrouter(modelId);
}

export function getStructuredLanguageModel() {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Please set OPENROUTER_API_KEY in your environment variables (get a key at https://openrouter.ai/keys).",
    );
  }

  const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
  const modelId =
    process.env.OPENROUTER_STRUCTURED_MODEL ??
    process.env.OPENROUTER_MODEL ??
    "meta-llama/llama-3.3-70b-instruct";
  return openrouter(modelId);
}
