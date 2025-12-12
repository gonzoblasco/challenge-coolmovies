import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string) => {
  let sanitizer;
  if (typeof window === 'undefined') {
    // Server-side
    // dynamically require jsdom to prevent webpack from bundling it for the client
    // eslint-disable-next-line
    const { JSDOM } = require('jsdom');
    const jsdomWindow = new JSDOM('').window;
    // Use type assertion to satisfy DOMPurify's type requirements
    sanitizer = DOMPurify(jsdomWindow as unknown as typeof globalThis);
  } else {
    // Client-side
    sanitizer = DOMPurify(window);
  }

  return sanitizer.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [], // Strict: no attributes allowed to prevent XSS via attributes
  });
};
