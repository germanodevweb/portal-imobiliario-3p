/** Remove vírgulas e espaços extras nas pontas (ex.: "Cristo Redentor,"). */
export function sanitizeNeighborhoodLabel(value: string): string {
  return value
    .trim()
    .replace(/^[,.\s]+|[,.\s]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
