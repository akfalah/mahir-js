export function normalizeCodeForCompare(code: string) {
  return code.replace(/\r\n/g, '\n').trim();
}