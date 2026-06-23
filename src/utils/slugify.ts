/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()                    // Convert to lowercase
    .trim()                          // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '')        // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-')        // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');        // Remove leading and trailing hyphens
}

/**
 * Generate a property URL.
 *
 * The canonical (and only) property detail route is /property/[id]. The slug is
 * no longer part of routing; the `title` parameter is kept for backward
 * compatibility with existing call sites but is intentionally unused.
 * @param id - Property ID
 * @param _title - Property title (unused; retained for call-site compatibility)
 * @returns Canonical property detail URL
 */
export function generatePropertyUrl(id: string, _title?: string): string {
  return `/property/${id}`;
}