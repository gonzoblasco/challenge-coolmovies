import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string) => {
  if (typeof window === 'undefined') return dirty; // Server-side fallback (or handle appropriately)
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [], // Strict: no attributes allowed to prevent XSS via attributes
  });
};
