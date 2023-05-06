import {
  BlockedByCloudflareError,
  HasAlreadyTitleError,
  makeTooManyRequestsError,
  makeUnauthorizedError,
  Result,
  TooManyRequestsError,
  UnauthorizedError,
} from "./errors.ts";
import { getAccessToken, resetAccessToken } from "./accessToken.ts";

declare const GM_fetch: (typeof fetch) | undefined;

export const generateChatTitle = (conversationId: string, messageId: string):
  | Promise<
    Result<
      string,
      | UnauthorizedError
      | BlockedByCloudflareError
      | TooManyRequestsError
      | HasAlreadyTitleError
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRes.value}`,
          Referrer: "https://chat.openai.com",
        },
        body: JSON.stringify({ message_id: messageId }),
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

    const json = await res.json() as { title: string } | {
      message: string;
    };
    return "title" in json ? { ok: true, value: json.title } : {
      ok: false,
      value: { name: "HasAlreadyTitleError", message: json.message },
    };
  })();
};
