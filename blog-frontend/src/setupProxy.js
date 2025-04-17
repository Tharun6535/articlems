const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Main API proxy
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error occurred');
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log successful proxy requests for debugging
        console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      }
    })
  );
  
  // Files/uploads specific proxy
  app.use(
    '/api/upload/files',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
}; 