/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
import {
  BlockedByCloudflareError,
  HTTPError,
  Result,
  TooLongMessageError,
  TooManyRequestsError,
  UnauthorizedError,
} from "./errors.ts";
import {
  makeTooManyRequestsError,
  makeUnauthorizedError,
} from "./makeError.ts";
import { getAccessToken, resetAccessToken } from "./accessToken.ts";
import { uuid } from "./uuid.ts";
import { Prompt, PromptContent, User } from "./types.ts";
import "./readableStream-polyfill.ts";

declare const GM_fetch: typeof fetch;

export interface MessageResponse {
  conversation_id: string;
  message: { id: string } & Prompt;
  error: Record<string, unknown>;
}

export interface SendMessageOptions {
  conversationId?: string;
  parentMessageId?: string;
  model?: string;
}

export interface Message {
  id: string;
  author: Pick<User, "role">;
  content: PromptContent;
}

export interface MessageRequest {
  action: "next";
  conversation_id?: string;
  messages: [Message];
  model: string;
  parent_message_id: string;
  timezone_offset_min: number;
  history_and_training_disabled: boolean;
}

export const sendMessage = (
  question: string,
  options?: SendMessageOptions,
):
  | Promise<
    Result<
      AsyncGenerator<MessageResponse, void, unknown>,
      | UnauthorizedError
      | BlockedByCloudflareError
      | TooManyRequestsError
      | TooLongMessageError
    >
  >
  | undefined => {
  if (!GM_fetch) return;

  const result = getAccessToken();
  if (!result) return;
  return (async () => {
    const tokenRes = await result;
    if (!tokenRes.ok) return tokenRes;
    const token = tokenRes.value;

    const message: MessageRequest = {
      action: "next",
      history_and_training_disabled: false,
      messages: [
        {
          id: uuid(),
          author: { role: "user" },
          content: {
            content_type: "text",
            parts: [question],
          },
        },
      ],
      model: options?.model ?? "text-davinci-002-render-sha",
      parent_message_id: options?.parentMessageId ?? uuid(),
      timezone_offset_min: getTimezone(),
    };
    if (options) message.conversation_id = options.conversationId;

    const res = await GM_fetch(
      "https://chat.openai.com/backend-api/conversation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Referrer: "https://chat.openai.com",
        },
        body: JSON.stringify(message),
      },
    );

    if (!res.ok) {
      switch (res.status) {
        case 401:
          resetAccessToken();
          return makeUnauthorizedError();
        case 429:
          return makeTooManyRequestsError();
        case 413:
          return {
            ok: false,
            value: {
              name: "TooLongMessageError",
              message: (await res.json()).detail?.message,
            },
          };
        default:
          throw new HTTPError(res);
      }
    }
    if (!res.body) {
      throw Error(
        "No content in Response of https://chat.openai.com/backend-api/conversation",
      );
    }

    return {
      ok: true,

      value: async function* () {
        let stack = "";
        // @ts-ignore Some browsers don't implement async iterator yet
        for await (const value of res.body) {
          stack += String.fromCharCode(...value);
          const items = stack.split(/\n\n/).map((item) =>
            item.replace(/^data: /, "")
          );
          // \n\nがなければ、読み込み継続
          if (items.length < 2) continue;
          // まだ継続するときは、それを残す。末尾が"\n\n"のときは空文字になるので、prevResはまっさらな状態となる
          stack = items.pop()!;
          for (const item of items) {
            if (item === "[DONE]") return;
            try {
              yield JSON.parse(item);
            } catch (e: unknown) {
              if (!(e instanceof SyntaxError)) throw e;
              console.error(e);
            }
          }
          if (stack === "[DONE]") return;
        }
      }(),
    };
  })();
};

const getTimezone = () => {
  const now = new Date();
  return now.getTimezoneOffset();
};
