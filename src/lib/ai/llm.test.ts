import { beforeEach, describe, expect, it, vi } from "vitest";

const { createGroqMock, createOpenRouterMock } = vi.hoisted(() => ({
  createGroqMock: vi.fn((config) => vi.fn((modelId) => ({ provider: "groq", modelId, config }))),
  createOpenRouterMock: vi.fn((config) => vi.fn((modelId) => ({ provider: "openrouter", modelId, config }))),
}));

vi.mock("@ai-sdk/groq", () => ({
  createGroq: createGroqMock,
}));

vi.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: createOpenRouterMock,
}));

import { getLanguageModel, getStructuredLanguageModel } from "@/lib/ai/llm";

describe("LLM provider selection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GROQ_API_KEY;
  });

  it("throws if no API keys are configured", () => {
    expect(() => getLanguageModel()).toThrow(/No AI API key configured/);
    expect(() => getStructuredLanguageModel()).toThrow(/No AI API key configured/);
  });

  it("uses OpenRouter when OPENROUTER_API_KEY is provided", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test-key";

    const model = getLanguageModel() as unknown as { provider: string; modelId: string };
    expect(createOpenRouterMock).toHaveBeenCalledWith({ apiKey: "sk-or-test-key" });
    expect(model.provider).toBe("openrouter");
    expect(model.modelId).toBe("meta-llama/llama-3.3-70b-instruct");

    const structuredModel = getStructuredLanguageModel() as unknown as { provider: string; modelId: string };
    expect(structuredModel.provider).toBe("openrouter");
    expect(structuredModel.modelId).toBe("meta-llama/llama-3.3-70b-instruct");
  });

  it("falls back to Groq when only GROQ_API_KEY is provided", () => {
    process.env.GROQ_API_KEY = "gsk-test-key";

    const model = getLanguageModel() as unknown as { provider: string; modelId: string };
    expect(createGroqMock).toHaveBeenCalledWith({ apiKey: "gsk-test-key" });
    expect(model.provider).toBe("groq");
    expect(model.modelId).toBe("llama-3.3-70b-versatile");

    const structuredModel = getStructuredLanguageModel() as unknown as { provider: string; modelId: string };
    expect(structuredModel.provider).toBe("groq");
    expect(structuredModel.modelId).toBe("llama-3.3-70b-versatile");
  });
});
