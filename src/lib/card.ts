export function maskCardToken(token: string): string {
  if (token.length <= 4) return token
  return `.... ${token.slice(-4)}`
}
