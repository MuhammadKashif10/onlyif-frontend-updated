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
 * Generate a property URL with ID and slug
 * @param id - Property ID
 * @param title - Property title
 * @returns SEO-friendly property URL
 */
export function generatePropertyUrl(id: string, title: string): string {
  const slug = slugify(title);
  return `/property/${id}${slug ? `/${slug}` : ''}`;
}