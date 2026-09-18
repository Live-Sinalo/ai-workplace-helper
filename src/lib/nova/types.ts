export type HistoryKind = "copy" | "analysis" | "document";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  preview: string;
  content: string;
  createdAt: number;
};

export type AiProvider = "openai" | "anthropic";

export type Settings = {
  provider: AiProvider;
  apiKey: string;
  model: string;
};

export const DEFAULT_SETTINGS: Settings = {
  provider: "openai",
  apiKey: "",
  model: "",
};

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-latest",
};
