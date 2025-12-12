import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHtml = (dirty: string) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [], // Strict: no attributes allowed to prevent XSS via attributes
  });
};
