import {
  BlockedByCloudflareError,
  Result,
  TooManyRequestsError,
  UnauthorizedError,
} from "./errors.ts";
import { getAccessToken, resetAccessToken } from "./accessToken.ts";
import { Prompt } from "./types.ts";
import {
  makeTooManyRequestsError,
  makeUnauthorizedError,
} from "./makeError.ts";

declare const GM_fetch: (typeof fetch) | undefined;

export interface Conversation {
  title: string;
  /** 会話を始めた日時 (UNIX TIME) */
  create_time: number;
  /** 最後に会話した日時 (UNIX TIME) */
  update_time: number;
  mapping: Record<string, MessageItem>;
  moderation_results: [];
  /** 一番最後の会話のID */
  current_node: string;
}

export interface MessageItem {
  id: string;
  message?: Prompt;
  parent?: string;
  children: string[];
}
/** get an existed conversation */
export const getConversation = (conversationId: string):
  | Promise<
    Result<
      Conversation,
      UnauthorizedError | BlockedByCloudflareError | TooManyRequestsError
    >
  >
  | undefined => {
  if (!GM_fetch) return;

  const result = getAccessToken();
  if (!result) return;
  return (async () => {
    const tokenRes = await result;
    if (!tokenRes.ok) return tokenRes;

    const res = await GM_fetch(
      `https://chat.openai.com/backend-api/conversation/${conversationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRes.value}`,
          Referrer: "https://chat.openai.com",
        },
      },
    );
    if (!res.ok) {
      switch (res.status) {
        case 401:
          resetAccessToken();
          return makeUnauthorizedError();
        case 429:
          return makeTooManyRequestsError();
      }
    }

    const value = await res.json() as Conversation;
    return { ok: true, value };
  })();
};
