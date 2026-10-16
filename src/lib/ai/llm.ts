import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getLanguageModel() {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (openrouterApiKey) {
    const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
    const modelId =
      process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct";
    return openrouter(modelId);
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    const groq = createGroq({ apiKey: groqApiKey });
    const modelId = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    return groq(modelId);
  }

  throw new Error(
    "No AI API key configured. Please set OPENROUTER_API_KEY in your environment variables (get a key at https://openrouter.ai/keys) or GROQ_API_KEY (https://console.groq.com/keys).",
  );
}

export function getStructuredLanguageModel() {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (openrouterApiKey) {
    const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
    const modelId =
      process.env.OPENROUTER_STRUCTURED_MODEL ??
      process.env.OPENROUTER_MODEL ??
      "meta-llama/llama-3.3-70b-instruct";
    return openrouter(modelId);
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    const groq = createGroq({ apiKey: groqApiKey });
    const modelId =
      process.env.GROQ_STRUCTURED_MODEL ??
      process.env.GROQ_MODEL ??
      "llama-3.3-70b-versatile";
    return groq(modelId);
  }

  throw new Error(
    "No AI API key configured. Please set OPENROUTER_API_KEY in your environment variables (get a key at https://openrouter.ai/keys) or GROQ_API_KEY (https://console.groq.com/keys).",
  );
}
