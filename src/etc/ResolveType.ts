/*
 * Resolves a variable type
 * */
export default function resolveType(o: any): string {
  if (o.toString() === "[object Object]") {
    return "object";
  } else if (Array.isArray(o)) {
    return "array";
  } else if (!isNaN(o + 0)) {
    return "number";
  } else {
    return "string";
  }
}
