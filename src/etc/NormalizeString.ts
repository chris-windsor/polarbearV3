/*
 * Strips whitespace and removes any characters besides alphanumeric characters, '$', '_'
 * */
export default function normalizeString(s: string): string {
  return s.replace(/[^A-z0-9_$]/g, "")
          .trim();
}
