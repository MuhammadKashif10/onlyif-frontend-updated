// Helpers for working with Cloudinary delivery URLs.

/**
 * Turn a Cloudinary delivery URL into a forced-download URL that preserves the
 * original file format (PDF/PNG/JPG, etc.).
 *
 * Cloudinary's `fl_attachment` flag sets `Content-Disposition: attachment`, so
 * the browser downloads the asset instead of previewing it. The original format
 * is preserved because Cloudinary serves the stored asset bytes/extension.
 * The HTML `download` attribute can't do this for Cloudinary because the asset
 * is served cross-origin (the attribute is ignored across origins).
 *
 * Non-Cloudinary URLs (or already-transformed ones) are returned unchanged.
 */
export function getCloudinaryDownloadUrl(url?: string | null, fileName?: string): string {
  if (!url) return '';
  // Only Cloudinary delivery URLs contain an `/upload/` segment.
  if (!url.includes('/upload/')) return url;
  // Don't double-inject if a transformation is already present.
  if (url.includes('fl_attachment')) return url;

  let flag = 'fl_attachment';
  if (fileName) {
    // Use the original name (without extension) as the download filename;
    // Cloudinary appends the correct extension for the stored format.
    const base = fileName.replace(/\.[^/.]+$/, '').trim();
    const safe = encodeURIComponent(base).replace(/%20/g, '_');
    if (safe) flag = `fl_attachment:${safe}`;
  }

  return url.replace('/upload/', `/upload/${flag}/`);
}
