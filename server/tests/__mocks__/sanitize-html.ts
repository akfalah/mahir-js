// tests/__mocks__/sanitize-html.ts
function sanitizeHtml(input: string): string {
  return input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
}

sanitizeHtml.simpleTransform = () => ({});

export default sanitizeHtml;