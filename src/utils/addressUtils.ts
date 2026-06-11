export const formatPropertyAddress = (address: any): string => {
  if (typeof address === 'string') {
    return address;
  }
  
  if (address && typeof address === 'object') {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    return parts.join(', ') || 'Address not available';
  }
  
  return 'Address not available';
};

/**
 * Build an address line for the property detail page that avoids visually
 * duplicating text already shown in the title (H1).
 *
 * The property title is always rendered as-is elsewhere; this helper only
 * decides what the *secondary* address line should contain so the two lines
 * don't repeat the same street/locality text.
 *
 * Rules:
 *  1. If the title already contains the entire formatted address -> return ''
 *     (caller hides the address line).
 *  2. Otherwise drop any *leading* address segments (comma-separated) that are
 *     already present in the title, e.g. when the title is the street address.
 *  3. If nothing remains after trimming -> return '' (hide).
 *  4. If the title is unrelated to the address -> return the address unchanged.
 *
 * Examples:
 *   title "2107/116 Bathurst Street",
 *   address "2107/116 Bathurst Street, Sydney, NSW 2000"
 *     -> "Sydney, NSW 2000"
 *
 *   title "Luxury Apartment in Sydney",
 *   address "2107/116 Bathurst Street, Sydney, NSW 2000"
 *     -> "2107/116 Bathurst Street, Sydney, NSW 2000" (street isn't in the title)
 */
export const getNonDuplicateAddress = (
  title: string | null | undefined,
  formattedAddress: string | null | undefined
): string => {
  const addr = (formattedAddress || '').trim();
  const ttl = (title || '').trim();

  if (!addr) return '';
  if (!ttl) return addr;

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedTitle = norm(ttl);

  // Rule 1: the title already shows the whole address.
  if (normalizedTitle.includes(norm(addr))) return '';

  // Rule 2: drop leading segments that the title already contains.
  const segments = addr.split(',').map((s) => s.trim()).filter(Boolean);
  let start = 0;
  while (start < segments.length && normalizedTitle.includes(norm(segments[start]))) {
    start += 1;
  }

  // Rule 3: every segment was a duplicate -> nothing new to show.
  if (start >= segments.length) return '';

  // Rules 2 & 4: remaining (or full) address.
  return segments.slice(start).join(', ');
};

// Add this function to safely get searchable address text
export const getSearchableAddress = (address: string | { street: string; city: string; state: string; zipCode: string; country: string } | undefined): string => {
  if (!address) return '';
  
  if (typeof address === 'string') {
    return address;
  }
  
  // If it's an object, combine the fields
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(' ');
};