/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />

export type Result<T, E = unknown> = { ok: true; value: T } | {
  ok: false;
  value: E;
};

export interface ErrorLike {
  name: string;
  message: string;
}

export interface TooManyRequestsError {
  name: "TooManyRequestsError";
  message: string;
}

export interface UnauthorizedError {
  name: "UnauthorizedError";
  message: string;
}

export interface BlockedByCloudflareError {
  name: "BlockedByCloudflareError";
  message: string;
}

export interface HasAlreadyTitleError {
  name: "HasAlreadyTitleError";
  message: string;
}

export const makeUnauthorizedError = (): {
  ok: false;
  value: UnauthorizedError;
} => ({
  ok: false,
  value: {
    name: "UnauthorizedError",
    message: "Please log in https://chat.openai.com.",
  },
});

export const makeTooManyRequestsError = (): {
  ok: false;
  value: TooManyRequestsError;
} => ({
  ok: false,
  value: { name: "TooManyRequestsError", message: "Too many request." },
});

export const makeBlockedByCloudflareError = (): {
  ok: false;
  value: BlockedByCloudflareError;
} => ({
  ok: false,
  value: {
    name: "BlockedByCloudflareError",
    message:
      "Please pass Cloudflare security check at https://chat.openai.com.",
  },
});

/** check whether to pass Cloudflare security check
 *
 * from https://github.com/zhengbangbo/chat-gpt-userscript/blob/d75a39c9ea3911c48c0979130cd3f79075912b6b/src/utils/parse.ts
 */
export const isBlockedByCloudflare = (responseText: string): boolean => {
  try {
    const html = new DOMParser().parseFromString(responseText, "text/html");
    if (!html) return false;
    // cloudflare html be like: https://github.com/zhengbangbo/chat-gpt-userscript/blob/512892caabef2820a3dc3ddfbcf5464fc63c405a/parse.js
    const title = html.querySelector("title");
    if (!title) return false;
    return title.innerText === "Just a moment...";
  } catch (_: unknown) {
    return false;
  }
};
