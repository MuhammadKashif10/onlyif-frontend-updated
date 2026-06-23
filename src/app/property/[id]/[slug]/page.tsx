import { redirect } from 'next/navigation';

/**
 * Legacy SEO route: /property/[id]/[slug]
 *
 * The slug is no longer used for routing. Every property detail experience is
 * served by the single canonical /property/[id] route, so this route now
 * redirects there permanently, preserving any existing/bookmarked slug links.
 */
export default async function PropertyDetailSlugRedirect({
  params,
}: {
  params: Promise<{ id: string; slug?: string }> | { id: string; slug?: string };
}) {
  const { id } = await params;
  redirect(`/property/${id}`);
}
