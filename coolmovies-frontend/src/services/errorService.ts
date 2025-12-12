export class ErrorService {
  private static instance: ErrorService;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public log(error: unknown, context: string): void {
    // In a real app, this would send to Sentry/Datadog
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${context}] Error:`, error);
  }

  public getUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === "object" && error !== null) {
        const rtqError = error as { data?: { message?: string }; message?: string };
        return rtqError.data?.message || rtqError.message || "An unexpected error occurred.";
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

export const errorService = ErrorService.getInstance();
