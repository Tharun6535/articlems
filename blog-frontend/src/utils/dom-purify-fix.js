/**
 * This module is a workaround for DOMPurify import issues.
 * It provides a consistent way to use DOMPurify across the application.
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - The HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitize = (html) => {
  try {
    // Only run in browser environment where window is available
    if (typeof window !== 'undefined' && DOMPurify) {
      return DOMPurify.sanitize(html);
    }
    // Fallback to basic sanitization if DOMPurify is not available
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Return empty string if there's an error sanitizing
    return '';
  }
};

export default {
  sanitize
}; 