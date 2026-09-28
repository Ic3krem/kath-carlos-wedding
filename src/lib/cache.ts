import { revalidatePath, revalidateTag } from 'next/cache';

/** Cache tag shared by every public content read (see lib/content.ts). */
export const CONTENT_TAG = 'site-content';

/** Seconds before cached content is re-read even without an admin save. */
export const CONTENT_TTL = 300;

/** Drop cached content so the next visitor sees an admin edit immediately. */
export function invalidateSite() {
  try {
    revalidateTag(CONTENT_TAG);
    revalidatePath('/');
  } catch {
    // Outside a Next request (unit tests) there is no cache to clear.
  }
}
