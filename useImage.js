import { useState, useEffect } from 'react';

/**
 * Custom hook for reliable image loading with multiple fallback strategies
 * @param {string} src - Original image URL
 * @returns {Object} Image state information
 */
const useImage = (src) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Default placeholder image
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    if (!src || src === '') {
      setImageSrc(placeholderImage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // Function to test if an image loads
    const testImageLoad = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
    };

    // Try to load the image with the original URL
    testImageLoad(src)
      .then(url => {
        console.log('Original image loaded successfully:', url);
        setImageSrc(url);
        setLoading(false);
      })
      .catch(err => {
        console.log('Original image failed to load, trying fallbacks');
        setAttemptCount(prev => prev + 1);

        // Extract filename from src
        const filename = src.substring(src.lastIndexOf('/') + 1);
        
        // Try alternative URL patterns
        const alternativeUrls = [
          `/public/images/${filename}`,
          `/media/image/${filename}`,
          `/api/images/file/${filename}`,
        ];
        
        // Try each alternative URL
        Promise.any(alternativeUrls.map(url => testImageLoad(url)))
          .then(url => {
            console.log('Alternative URL loaded successfully:', url);
            setImageSrc(url);
            setLoading(false);
          })
          .catch(err => {
            console.log('All direct URLs failed, trying data URI fallback');
            
            // As a last resort, fetch base64 data URI
            fetch(`/api/fallback/image/${filename}`)
              .then(response => {
                if (!response.ok) throw new Error('Fallback API failed');
                return response.json();
              })
              .then(data => {
                console.log('Using data URI fallback');
                setImageSrc(data.dataUri);
                setLoading(false);
              })
              .catch(err => {
                console.error('All loading strategies failed:', err);
                setImageSrc(placeholderImage);
                setError(true);
                setLoading(false);
              });
          });
      });
  }, [src, attemptCount]);

  return { imageSrc, loading, error, retry: () => setAttemptCount(prev => prev + 1) };
};

export default useImage; 