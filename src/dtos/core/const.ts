export type ApiResponseStatus = "Ok" | "Error";

export const API_RESPONSE_STATUS: {
  readonly [key in ApiResponseStatus]: ApiResponseStatus;
} = {
  Ok: "Ok",
  Error: "Error",
} as const;