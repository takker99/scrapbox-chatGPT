// from https://github.com/transitive-bullshit/chatgpt-api/blob/v5.2.2/src/types.ts#L154C13-L164
export interface PromptContent {
  /** The content type of the prompt */
  content_type: "text";

  /** The parts to the prompt */
  parts: string[];
}

export type Role = "user" | "assistant" | "system";

export interface User {
  role: Role;
  metadata: Record<string, unknown>;
}

export interface Prompt {
  /** メッセージの作成日時 (UNIX TIME) */
  create_time: number;
  author: User;
  content: PromptContent;
  end_turn?: boolean;
  weight: 1;
  metadata: Record<string, unknown>;
  recipient: string;
}
