import {
  BlockedByCloudflareError,
  Result,
  UnauthorizedError,
} from "./errors.ts";
import {
  isBlockedByCloudflare,
  makeBlockedByCloudflareError,
  makeUnauthorizedError,
} from "./makeError.ts";

declare const GM_fetch: (typeof fetch) | undefined;

let accessToken = "";
let tokenExpires = 0;

export interface ChatGPTSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    picture: string;
    mfa: boolean;
    groups: unknown[];
    intercom_hash: string;
  };
  /** ISO8601形式 */
  expires: string;
  accessToken: string;
  authProvider: string;
}

/** chatGPTのaccess tokenを取得する
 *
 * 一度取得したものをcacheに保持し、有効期限が切れるまでそれを返す
 * @return 成功時はaccess token、失敗時はエラー情報を返す
 */
export const getAccessToken = ():
  | Promise<
    Result<string, UnauthorizedError | BlockedByCloudflareError>
  >
  | undefined => {
  if (accessToken && tokenExpires > new Date().getTime()) {
    return Promise.resolve({
      ok: true,
      value: accessToken,
    });
  }

  if (!GM_fetch) return;

  return (async () => {
    const res = await GM_fetch("https://chat.openai.com/api/auth/session");
    const text = await res.text();

    if (isBlockedByCloudflare(text)) return makeBlockedByCloudflareError();
    const json = JSON.parse(text) as ChatGPTSession;
    if (!json.accessToken) return makeUnauthorizedError();
    const { accessToken: token, expires } = json;
    if (expires) tokenExpires = new Date(expires).getTime();
    accessToken = token;
    return { ok: true, value: token };
  })();
};

export const resetAccessToken = (): void => {
  accessToken = "";
};
