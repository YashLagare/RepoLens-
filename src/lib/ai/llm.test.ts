import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOpenRouterMock } = vi.hoisted(() => ({
  createOpenRouterMock: vi.fn((config) =>
    vi.fn((modelId) => ({ provider: "openrouter", modelId, config })),
  ),
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
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_STRUCTURED_MODEL;
  });

  it("throws if OPENROUTER_API_KEY is not configured", () => {
    expect(() => getLanguageModel()).toThrow(/OPENROUTER_API_KEY is not configured/);
    expect(() => getStructuredLanguageModel()).toThrow(/OPENROUTER_API_KEY is not configured/);
  });

  it("uses OpenRouter default models when OPENROUTER_API_KEY is provided", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test-key";

    const model = getLanguageModel() as unknown as { provider: string; modelId: string };
    expect(createOpenRouterMock).toHaveBeenCalledWith({ apiKey: "sk-or-test-key" });
    expect(model.provider).toBe("openrouter");
    expect(model.modelId).toBe("meta-llama/llama-3.3-70b-instruct");

    const structuredModel = getStructuredLanguageModel() as unknown as { provider: string; modelId: string };
    expect(structuredModel.provider).toBe("openrouter");
    expect(structuredModel.modelId).toBe("meta-llama/llama-3.3-70b-instruct");
  });

  it("respects OPENROUTER_MODEL and OPENROUTER_STRUCTURED_MODEL overrides", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test-key";
    process.env.OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet";
    process.env.OPENROUTER_STRUCTURED_MODEL = "openai/gpt-4o-mini";

    const model = getLanguageModel() as unknown as { provider: string; modelId: string };
    expect(model.modelId).toBe("anthropic/claude-3.5-sonnet");

    const structuredModel = getStructuredLanguageModel() as unknown as { provider: string; modelId: string };
    expect(structuredModel.modelId).toBe("openai/gpt-4o-mini");
  });
});
