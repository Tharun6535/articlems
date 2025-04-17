/**
 * Utility function to format image URLs consistently across the application
 * Handles various image path formats and ensures they work with authentication
 * @param {string} imagePath - The path to the image from the API
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  
  // If it's already a full URL, use it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle various path formats
  if (imagePath.startsWith('/api/upload/files/')) {
    return `${window.location.origin}${imagePath}`;
  }
  
  if (imagePath.startsWith('/api')) {
    return `${window.location.origin}/api${imagePath.substring(4)}`;
  }
  
  if (imagePath.startsWith('/')) {
    return `${window.location.origin}${imagePath}`;
  }
  
  // Default case - assume it's a filename that should go in the upload files directory
  return `${window.location.origin}/api/upload/files/${imagePath}`;
};

/**
 * Get a data URI for a fallback image when the original fails to load
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @param {string} text - Text to display in the placeholder
 * @returns {string} - Data URI for a fallback image
 */
export const getFallbackImageUrl = (width = 400, height = 200, text = 'Image Failed') => {
  return `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22${width}%22%20height%3D%22${height}%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20${width}%20${height}%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189dc1d4c4c%20text%20%7B%20fill%3A%23777%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A18pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189dc1d4c4c%22%3E%3Crect%20width%3D%22${width}%22%20height%3D%22${height}%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22${width/3}%22%20y%3D%22${height/2 + 10}%22%3E${text}%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E`;
};

export default {
  getImageUrl,
  getFallbackImageUrl
}; 