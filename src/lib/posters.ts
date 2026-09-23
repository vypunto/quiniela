/**
 * Poster provider abstraction for SmallParadiso.
 *
 * Currently returns placeholder SVG data URIs using the movie's posterColor
 * and initials. Can be extended to fetch real poster images from an API.
 */

/**
 * Generate a data URI for a placeholder SVG with centered initials on a colored background.
 *
 * @param initials - The initials to display (e.g. "LO" for "La Odisea")
 * @param bgColor - Hex color string for the background (e.g. "#1a3a5c")
 * @returns A data URI string for the SVG image
 */
export function getPosterPlaceholderSvg(initials: string, bgColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="${bgColor}"/>
  <text x="150" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Extract initials from a movie title.
 * Takes the first letter of up to 2 significant words (skipping articles).
 */
function getInitials(title: string): string {
  const skipWords = new Set(['la', 'el', 'los', 'las', 'un', 'una', 'de', 'del', 'al']);
  const words = title.split(/\s+/).filter((w) => !skipWords.has(w.toLowerCase()));

  if (words.length === 0) return title.charAt(0).toUpperCase();
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Get poster information for a movie.
 *
 * Returns the poster source URL, alt text, and a placeholder data URI.
 * Currently always returns placeholder data; can be extended to return
 * real poster URLs from an image service.
 *
 * @param movie - Object with movie id, slug, and optional posterColor
 * @returns Object with src (poster URL), alt text, and placeholder data URI
 */
export function getMoviePoster(movie: {
  id: string;
  slug: string;
  posterColor?: string;
}): { src: string; alt: string; placeholder: string } {
  const bgColor = movie.posterColor || '#2a2a2a';
  const titleFromSlug = movie.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const initials = getInitials(titleFromSlug);
  const placeholder = getPosterPlaceholderSvg(initials, bgColor);

  return {
    src: placeholder, // In the future, return a real poster URL here
    alt: `Poster de ${titleFromSlug}`,
    placeholder,
  };
}
