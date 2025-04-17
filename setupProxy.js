const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No rewriting needed as paths match
      },
      // Critical for properly handling image requests
      onProxyRes: function(proxyRes, req, res) {
        // Log proxy responses for debugging
        console.log('Proxying:', req.method, req.url, '->', proxyRes.statusCode);
        
        // Ensure proper headers for images
        if (req.url.includes('/files/images/') || req.url.includes('/images/')) {
          // Remove any authentication headers for image requests
          delete proxyRes.headers['www-authenticate'];
          
          // Make sure CORS headers are properly set
          proxyRes.headers['access-control-allow-origin'] = '*';
          proxyRes.headers['access-control-allow-methods'] = 'GET, HEAD, OPTIONS';
          proxyRes.headers['access-control-allow-headers'] = '*';
        }
      },
    })
  );

  // Additional proxy for direct public image access
  app.use(
    '/public',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
}; 