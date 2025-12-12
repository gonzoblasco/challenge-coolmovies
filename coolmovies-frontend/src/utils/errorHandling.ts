export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const rtqError = error as { data?: { message?: string }; message?: string };
    return rtqError.data?.message || rtqError.message || "Unknown error";
  }
  return "Unknown error";
};
