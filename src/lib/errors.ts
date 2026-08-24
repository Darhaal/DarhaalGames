/**
 * Safely extract a message from an unknown error (for catch blocks).
 *
 * Supabase rejections (PostgrestError, AuthError, StorageError) are plain
 * objects carrying `message`/`code`, not Error instances — so a bare
 * `String(e)` on them renders the useless "[object Object]" that used to reach
 * the user in toasts. Read `message` off any object that has one before
 * falling back.
 */
export const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;

  if (e && typeof e === 'object') {
    const { message, code } = e as { message?: unknown; code?: unknown };
    if (typeof message === 'string' && message.length > 0) {
      // Keep the SQLSTATE when there is one — "42501" turns an opaque
      // "permission denied" into something diagnosable.
      return typeof code === 'string' && code.length > 0
        ? `${message} (${code})`
        : message;
    }
  }

  return String(e);
};
