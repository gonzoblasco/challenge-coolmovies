import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string) => {
  let sanitizer;
  if (typeof window === 'undefined') {
    // Server-side
    // dynamically require jsdom to prevent webpack from bundling it for the client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    sanitizer = DOMPurify(window as unknown as Window);
  } else {
    // Client-side
    sanitizer = DOMPurify(window);
  }

  return sanitizer.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [], // Strict: no attributes allowed to prevent XSS via attributes
  });
};
