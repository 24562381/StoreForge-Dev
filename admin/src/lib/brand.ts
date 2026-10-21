/**
 * Helper utility to derive brand/store abbreviation initials for UI badges.
 *
 * Rules:
 * 1. If multi-word (e.g. "Wooden Mir" or "Store Forge" or "WOODEN WORLD MAP"):
 *    First letter of first word + first letter of last word (e.g. "WM", "SF").
 * 2. If single word with camelCase/PascalCase uppercase letters (e.g. "StoreForge"):
 *    Immediate first two uppercase letters (e.g. 'S' + 'F' -> "SF").
 * 3. Fallback for single word without multiple uppercase letters (e.g. "Shop" -> "SH", "Store" -> "ST"):
 *    First two letters uppercased.
 */
export function getBrandInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'SF';
  const trimmed = name.trim();
  if (!trimmed) return 'SF';

  // 1. If name has two or more parts/words (split by spaces, hyphens, underscores)
  const words = trimmed.split(/[\s\-_]+/).filter(Boolean);
  if (words.length >= 2) {
    const firstChar = words[0].charAt(0);
    const lastChar = words[words.length - 1].charAt(0);
    if (firstChar && lastChar) {
      return (firstChar + lastChar).toUpperCase();
    }
  }

  // 2. Immediate first two uppercase letters from the name (e.g. "StoreForge" -> "SF")
  const upperMatches = trimmed.match(/[A-Z]/g);
  if (upperMatches && upperMatches.length >= 2) {
    return (upperMatches[0] + upperMatches[1]).toUpperCase();
  }

  // 3. Fallback for single word without two uppercase letters (e.g. "Wooden" -> "WO", "shop" -> "SH")
  const lettersOnly = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (lettersOnly.length >= 2) {
    return lettersOnly.slice(0, 2).toUpperCase();
  }
  if (lettersOnly.length === 1) {
    return lettersOnly.toUpperCase();
  }

  return 'SF';
}
