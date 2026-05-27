/**
 * Safely defers code execution to a separate macro-task thread.
 * @param ms The duration to delay in milliseconds (defaults to 0 for a simple event-loop deferral).
 */
export const delay = (ms = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
