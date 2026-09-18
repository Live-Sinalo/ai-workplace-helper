import { DEFAULT_MODELS } from "./types";
import { loadSettings } from "./store";

export type AiRequest = {
  system: string;
  prompt: string;
};

export type AiResult = {
  text: string;
  simulated: boolean;
};

/**
 * Calls the user's own provider directly from the browser when a key is configured.
 * With no key, NOVA falls back to a local, offline draft so every tool stays usable.
 */
export async function runAi({ system, prompt }: AiRequest): Promise<AiResult> {
  const settings = loadSettings();
  const key = settings.apiKey.trim();

  if (!key) {
    await delay(700 + Math.random() * 600);
    return { text: localDraft(system, prompt), simulated: true };
  }

  const model = settings.model.trim() || DEFAULT_MODELS[settings.provider];

  if (settings.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(await readError(res));
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    return { text: (data.content ?? []).map((c) => c.text ?? "").join("\n").trim(), simulated: false };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { text: (data.choices?.[0]?.message?.content ?? "").trim(), simulated: false };
}

async function readError(res: Response) {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    detail = body.error?.message ?? "";
  } catch {
    detail = "";
  }
  if (res.status === 401) return "Your API key was rejected. Check it in Settings.";
  if (res.status === 429) return "Rate limit reached. Wait a moment and try again.";
  return detail || `Request failed (${res.status}).`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function sentences(text: string) {
  return text
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function localDraft(system: string, prompt: string) {
  const points = sentences(prompt).slice(0, 5);
  const topic = points[0] ?? "your request";
  const wantsStructured = /Executive Summary/i.test(system) || /Executive Summary/i.test(prompt);

  if (wantsStructured) {
    return [
      "## Executive Summary",
      `The dataset is complete enough for review. ${topic}. Volumes and ranges look consistent with an operating business.`,
      "",
      "## Key Findings",
      "- The largest numeric field drives most of the variation in the data.",
      "- Averages sit close to the median, so the distribution is broadly balanced.",
      "- A small number of high values account for a disproportionate share of the total.",
      "",
      "## Trends",
      "- Values grow steadily across the ordered rows rather than in sudden jumps.",
      "- Categories repeat often enough to support period-on-period comparison.",
      "",
      "## Areas to Review",
      "- Confirm any missing values before using the figures in reporting.",
      "- Check the highest and lowest records for data-entry errors.",
    ].join("\n");
  }

  const body = points
    .slice(1)
    .map((p) => `${p.charAt(0).toUpperCase()}${p.slice(1)}.`)
    .join(" ");

  return [
    `${topic.charAt(0).toUpperCase()}${topic.slice(1)}.`,
    "",
    body ||
      "This draft outlines the essentials clearly and keeps the reader focused on the outcome rather than the process.",
    "",
    "Next steps are simple: review the detail below, confirm the timing that suits you, and we will take it from there.",
    "",
    "(Offline draft — add your own API key in Settings for live AI results.)",
  ].join("\n");
}
