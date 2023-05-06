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

export interface TooLongMessageError {
  name: "TooLongMessageError";
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

export class HTTPError extends Error {
  name = "HTTPError";

  constructor(
    public response: Response,
  ) {
    super(
      `${response.status} ${response.statusText} when fetching ${response.url}`,
    );

    // @ts-ignore only available on V8
    if (Error.captureStackTrace) {
      // @ts-ignore only available on V8
      Error.captureStackTrace(this, HTTPError);
    }
  }
}
