/**
 * This is a custom webpack configuration file to resolve dependency issues
 */
module.exports = {
  resolve: {
    fallback: {
      path: false,
      fs: false
    },
    alias: {
      // Ensure dompurify is resolved from the correct location
      dompurify: require.resolve('dompurify')
    }
  }
}; 