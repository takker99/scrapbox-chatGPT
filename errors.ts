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
