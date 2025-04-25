/**
 * Utility functions for formatting and masking sensitive data
 */

/**
 * Masks an email address by showing only the first character and domain
 * Example: j***@example.com
 * 
 * @param {string} email - The email address to mask
 * @returns {string} The masked email address
 */
export const maskEmail = (email) => {
  if (!email) return '';
  
  try {
    const [username, domain] = email.split('@');
    if (!username || !domain) return '***@***';
    
    const firstChar = username.charAt(0);
    const maskedUsername = firstChar + '*'.repeat(Math.max(2, username.length - 1));
    
    return `${maskedUsername}@${domain}`;
  } catch (error) {
    console.error('Error masking email:', error);
    return '***@***';
  }
};

/**
 * Obfuscates a specific portion of text by replacing characters with asterisks
 * 
 * @param {string} text - The text to partially obfuscate
 * @param {number} visibleStart - Number of characters to show at the start
 * @param {number} visibleEnd - Number of characters to show at the end
 * @returns {string} The obfuscated text
 */
export const obfuscateText = (text, visibleStart = 1, visibleEnd = 1) => {
  if (!text) return '';
  
  try {
    if (text.length <= visibleStart + visibleEnd) {
      return '*'.repeat(text.length);
    }
    
    const start = text.substring(0, visibleStart);
    const end = text.substring(text.length - visibleEnd);
    const middle = '*'.repeat(Math.max(2, text.length - visibleStart - visibleEnd));
    
    return `${start}${middle}${end}`;
  } catch (error) {
    console.error('Error obfuscating text:', error);
    return '******';
  }
};

/**
 * Formats a date string to a localized format
 * 
 * @param {string} dateString - The date string to format
 * @param {Object} options - Formatting options for toLocaleDateString
 * @returns {string} The formatted date
 */
export const formatDate = (dateString, options = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
}; 