import { ENV } from "../config/env.js";
import { generateStreamToken } from "../config/stream.js";

const OPENROUTER_URL = `${ENV.OPENROUTER_BASE_URL}/chat/completions`;
const DEFAULT_OPENROUTER_MODEL = "gpt-4o-mini";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.auth().userId);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in generating stream token:", error);
    res.status(500).json({ error: error.message });
  }
};

const formatMessagesForPrompt = (messages = []) => {
  return messages
    .filter((message) => message?.text)
    .slice(-25)
    .map((message) => {
      const userName = message.userName || message.user?.name || message.user?.id || "Unknown";
      const text = message.text?.trim() || "";
      return `${userName}: ${text}`;
    })
    .join("\n");
};

const parseOpenRouterJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Unable to parse JSON from OpenRouter response");
    }
    return JSON.parse(match[0]);
  }
};

const generateOpenRouterSummary = async (channelName, messages) => {
  if (!ENV.OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const conversation = formatMessagesForPrompt(messages);
  const prompt = `You are a helpful assistant that summarizes team chat conversations. Return only valid JSON with two fields: \"summary\" and \"actionItems\". Example output format:\n\n{\n  \"summary\": \"...\",\n  \"actionItems\": [\"...\", \"...\", \"...\"]\n}\n\nSummarize the conversation below from channel #${channelName || "general"}. Keep the summary concise and include three clear action items. Do not include any markdown formatting in the JSON output.\n\nConversation:\n${conversation}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ENV.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "You summarize team chat conversations into a short summary and a list of action items.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
      n: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const output = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;

  if (!output) {
    throw new Error("OpenRouter returned no summary content.");
  }

  const parsed = parseOpenRouterJson(output);

  return {
    summary: parsed.summary?.trim() || output.trim(),
    actionItems: Array.isArray(parsed.actionItems)
      ? parsed.actionItems.map((item) => String(item).trim()).filter(Boolean)
      : [],
  };
};

export const summarizeChannel = async (req, res) => {
  try {
    const { channelName, messages } = req.body;
    const { summary, actionItems } = await generateOpenRouterSummary(channelName, messages);
    res.status(200).json({ summary, actionItems });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: error.message || "Unable to generate summary." });
  }
};
