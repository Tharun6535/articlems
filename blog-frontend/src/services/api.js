import axios from 'axios';
import authHeader from './auth-header';

// Update the API URL to match where your backend is running
// Using absolute URL since we've seen images using http://localhost:8080
export const API_URL = 'http://localhost:8080/api';
// Fallback to relative URL if needed
// const API_URL = '/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to add auth headers
api.interceptors.request.use(
  (config) => {
    const headers = authHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Get detailed error information
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
      
      // Handle 401 Unauthorized errors (expired token)
      if (error.response.status === 401) {
        // Clear local storage and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    // Attach the readable error message to the error object
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Articles API
export const getArticles = (title = '') => {
  return api.get('/articles', { params: { title } });
};

// New pagination API for articles
export const getArticlesPaginated = (page = 0, size = 10, sortField = 'id', sortDirection = 'desc', title = '') => {
  return api.get('/articles/paged', {
    params: {
      page,
      size,
      sort: `${sortField},${sortDirection}`,
      title
    }
  });
};

export const getArticlesByCategory = (categoryId, page = 0, size = 10, sortField = 'id', sortDirection = 'desc') => {
  return api.get(`/articles/category/${categoryId}/paged`, {
    params: {
      page,
      size,
      sort: `${sortField},${sortDirection}`
    }
  });
};

export const getArticleById = (id) => {
  return api.get(`/articles/${id}`);
};

export const createArticle = (article) => {
  // Log the incoming article data
  console.log('Creating article with data:', JSON.stringify(article, null, 2));
  
  // Ensure categoryId is a number
  if (article.categoryId && typeof article.categoryId === 'string') {
    article.categoryId = parseInt(article.categoryId, 10);
  }
  
  // Log the final data being sent
  console.log('Sending article data to server:', JSON.stringify(article, null, 2));
  
  return api.post('/articles', article)
    .then(response => {
      console.log('Article created successfully:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error creating article:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error;
    });
};

export const updateArticle = (id, article) => {
  // Ensure categoryId is a number
  if (article.categoryId && typeof article.categoryId === 'string') {
    article.categoryId = parseInt(article.categoryId, 10);
  }
  
  // Ensure version is included
  if (article.version === undefined) {
    console.warn('Warning: Article version is missing for optimistic locking');
  }
  
  return api.put(`/articles/${id}`, article);
};

export const deleteArticle = (id) => {
  return api.delete(`/articles/${id}`);
};

export const deleteAllArticles = () => {
  return api.delete('/articles');
};

// Categories API
export const getCategories = () => {
  return api.get('/categories');
};

// New pagination API for categories
export const getCategoriesPaginated = (page = 0, size = 10, sortField = 'id', sortDirection = 'desc') => {
  return api.get('/categories/paged', {
    params: {
      page,
      size,
      sort: `${sortField},${sortDirection}`
    }
  });
};

export const getCategoryById = (id) => {
  return api.get(`/categories/${id}`);
};

export const createCategory = (category) => {
  return api.post('/categories', category);
};

export const updateCategory = (id, category) => {
  return api.put(`/categories/${id}`, category);
};

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

// Comments API
export const getCommentsByArticleId = (articleId) => {
  return api.get(`/comments/article/${articleId}`);
};

export const createComment = (comment) => {
  // Ensure articleId is a number
  if (comment.articleId && typeof comment.articleId === 'string') {
    comment.articleId = parseInt(comment.articleId, 10);
  }
  
  return api.post('/comments', comment);
};

export const updateComment = (id, comment) => {
  return api.put(`/comments/${id}`, comment);
};

export const deleteComment = (id) => {
  return api.delete(`/comments/${id}`);
};

// File upload API
export const uploadImage = (file, onProgressCallback) => {
  if (!file) {
    console.error('No file provided for upload');
    return Promise.reject(new Error('No file provided'));
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    console.error('File too large:', file.size);
    return Promise.reject(new Error('File size exceeds 5MB limit'));
  }
  
  console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Log the FormData contents for debugging
  console.log('Form data created with file:', file.name);
  
  // Ensure correct API endpoint URL
  const uploadUrl = `${API_URL}/upload/image`;
  console.log('Sending to:', uploadUrl);
  
  // Use direct axios instance
  return axios.post(uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeader() // Add auth headers
    },
    withCredentials: true,
    timeout: 60000, // Increase timeout for large files
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
      
      // Call the progress callback if provided
      if (typeof onProgressCallback === 'function') {
        onProgressCallback(progressEvent);
      }
    }
  }).then(response => {
    console.log('Upload successful, response:', response);
    // Simplify the response to avoid long strings
    if (response.data && response.data.url) {
      // Just return the relative path without domain, removing any http://localhost:8080 prefix
      if (response.data.url.includes('http')) {
        const url = new URL(response.data.url);
        response.data.url = url.pathname;
      }
    }
    return response;
  }).catch(error => {
    console.error('Upload error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  });
};

// File upload API - CSV import
export const uploadCsv = (file) => {
  if (!file) {
    console.error('No file provided for upload');
    return Promise.reject(new Error('No file provided'));
  }
  
  console.log('Uploading CSV file:', file.name, 'size:', file.size, 'type:', file.type);
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Log the FormData contents for debugging
  console.log('Form data created with file:', file.name);
  
  // Use direct endpoint URL instead of relative path
  const uploadUrl = `${API_URL}/upload/csv`;
  console.log('Sending CSV to:', uploadUrl);
  
  // Use axios directly instead of the api instance
  return axios.post(uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeader() // Add auth headers manually
    },
    withCredentials: true,
    timeout: 60000, // Longer timeout for CSV processing
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
    }
  }).then(response => {
    console.log('CSV Upload successful, response:', response);
    return response;
  }).catch(error => {
    console.error('CSV Upload error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  });
};

export default {
  getArticles,
  getArticlesPaginated,
  getArticlesByCategory,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  deleteAllArticles,
  getCategories,
  getCategoriesPaginated,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCommentsByArticleId,
  createComment,
  updateComment,
  deleteComment,
  uploadImage,
  uploadCsv
}; 