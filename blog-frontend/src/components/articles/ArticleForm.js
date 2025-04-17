import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  Input,
  InputAdornment,
  Grid,
  LinearProgress,
  useTheme,
  Chip,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getArticleById, createArticle, updateArticle, getCategories, uploadImage } from '../../services/api';
import { API_URL } from '../../services/api';
import axios from 'axios';

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const theme = useTheme();
  
  console.log('%c ArticleForm Component Rendered ', 'background: #222; color: #bada55');
  console.log('Component props:', { id, isEditMode });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    statusEnum: 'PUBLISHED',
    imagePath: '',
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    console.log('ArticleForm component mounted');
    console.log('isEditMode:', isEditMode);
    console.log('Article ID from params:', id);

    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        // Check if response has a data property and it's an array
        const categoriesData = response.data && Array.isArray(response.data) 
          ? response.data 
          : [];
        setCategories(categoriesData);
        console.log('Categories fetched:', categoriesData);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again later.');
        // Set categories to empty array to avoid map error
        setCategories([]);
      }
    };

    fetchCategories();

    if (isEditMode) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          console.log('Fetching article with ID:', id);
          
          // Try a direct axios call without using the service
          try {
            console.log(`Attempting direct API call to ${API_URL}/articles/${id}`);
            const directResponse = await axios.get(`${API_URL}/articles/${id}`, {
              withCredentials: true,
              headers: {
                'Authorization': localStorage.getItem('user') ? 
                  'Bearer ' + JSON.parse(localStorage.getItem('user')).accessToken : ''
              }
            });
            
            console.log('Direct API call successful:', directResponse.data);
            
            if (!directResponse.data) {
              throw new Error('No article data received from direct call');
            }
            
            const articleData = directResponse.data;
            
            // Use null check for each property
            setFormData({
              title: articleData.title || '',
              content: articleData.content || '',
              categoryId: articleData.categoryId || '',
              statusEnum: articleData.statusEnum || 'PUBLISHED',
              imagePath: articleData.imagePath || '',
            });
            
            console.log('Form data set from direct call:', {
              title: articleData.title || '',
              content: articleData.content || '',
              categoryId: articleData.categoryId || '',
              statusEnum: articleData.statusEnum || 'PUBLISHED',
              imagePath: articleData.imagePath || '',
            });
            
            if (articleData.imagePath) {
              setImagePreview(articleData.imagePath);
              console.log('Image preview set:', articleData.imagePath);
            }
            
            setError(null);
          } catch (directErr) {
            console.error('Direct API call failed:', directErr);
            console.error('Falling back to service method...');
            
            // Fall back to original method
            const response = await getArticleById(id);
            console.log('Article data received from service:', response.data);
            
            if (!response.data) {
              throw new Error('No article data received from service');
            }
            
            const articleData = response.data;
            
            // Use null check for each property
            setFormData({
              title: articleData.title || '',
              content: articleData.content || '',
              categoryId: articleData.categoryId || '',
              statusEnum: articleData.statusEnum || 'PUBLISHED',
              imagePath: articleData.imagePath || '',
            });
            
            if (articleData.imagePath) {
              setImagePreview(articleData.imagePath);
            }
          }
        } catch (err) {
          console.error('Failed to fetch article:', err);
          console.error('Error details:', err.response ? err.response.data : err.message);
          
          // Set more descriptive error message
          let errorMessage = 'Failed to load article. Please try again later.';
          if (err.response) {
            if (err.response.status === 404) {
              errorMessage = `Article with ID ${id} not found.`;
            } else if (err.response.status === 403) {
              errorMessage = 'You do not have permission to view this article.';
            } else if (err.response.data && err.response.data.error) {
              errorMessage = `Error: ${err.response.data.error}`;
            }
          } else if (err.request) {
            errorMessage = 'No response received from server. Please check your connection.';
          } else {
            errorMessage = `Error: ${err.message}`;
          }
          setError(errorMessage);
          
          // Redirect to articles list after a timeout if article not found
          if (err.response && err.response.status === 404) {
            setTimeout(() => {
              navigate('/admin/dashboard');
            }, 3000);
          }
        } finally {
          setLoading(false);
          console.log('Article loading complete');
        }
      };

      fetchArticle();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setError(null);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.length > 4000) {
      errors.content = 'Content must be less than 4000 characters';
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    
    if (!formData.statusEnum) {
      errors.statusEnum = 'Status is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First, upload the image if there's a new one
      let uploadedImagePath = '';
      if (imageFile) {
        try {
          // Start with 0 progress
          setUploadProgress(0);
          console.log('Uploading new image file...');
          
          // Create a custom onUploadProgress handler to update state
          const uploadResponse = await uploadImage(imageFile, (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
            setUploadProgress(percentCompleted);
          });
          
          // Reset progress when done
          setUploadProgress(100); // Show completed for a moment
          
          // Simply use the URL returned from the API without modification
          if (uploadResponse.data && uploadResponse.data.url) {
            uploadedImagePath = uploadResponse.data.url;
            console.log('Image uploaded successfully, path:', uploadedImagePath);
          } else {
            throw new Error('Invalid response from image upload');
          }
          
        } catch (uploadErr) {
          console.error('Failed to upload image:', uploadErr);
          setError(`Failed to upload image: ${uploadErr.message || 'Unknown error'}`);
          setUploadProgress(0);
          setLoading(false);
          return; // Stop the submission if image upload fails
        }
      }
      
      // Prepare article data - use the image path directly as returned from server
      const finalImagePath = imageFile ? uploadedImagePath : formData.imagePath;
      
      // Ensure categoryId is a number
      const categoryId = formData.categoryId ? 
        (typeof formData.categoryId === 'string' ? parseInt(formData.categoryId, 10) : formData.categoryId) : 
        null;
      
      // Include image path in article data
      const articleData = {
        ...formData,
        categoryId,
        imagePath: finalImagePath || '', // Use empty string if no image path
      };
      
      console.log('Saving article with data:', articleData);
      
      if (isEditMode) {
        // Update existing article
        try {
          const updateResponse = await updateArticle(id, articleData);
          console.log("Article updated successfully:", updateResponse.data);
          
          navigate(`/articles/${id}`);
        } catch (updateErr) {
          console.error("Update error:", updateErr);
          
          // Detailed error handling
          if (updateErr.response) {
            console.error('Error response:', updateErr.response.data);
            throw new Error(updateErr.response.data?.message || 'Failed to update article');
          } else if (updateErr.request) {
            console.error('No response received:', updateErr.request);
            throw new Error('No response from server. Please check your connection.');
          } else {
            throw updateErr;
          }
        }
      } else {
        // Create new article
        try {
          const createResponse = await createArticle(articleData);
          console.log("Article created successfully:", createResponse.data);
          
          // Navigate to the new article page
          navigate(`/articles/${createResponse.data.id}`);
        } catch (createErr) {
          console.error("Create error:", createErr);
          
          // Detailed error handling
          if (createErr.response) {
            console.error('Error response:', createErr.response.data);
            
            // Handle authentication errors
            if (createErr.response.status === 401) {
              setError('Your session has expired. Please log in again.');
              // Redirect to login after a delay
              setTimeout(() => {
                navigate('/login');
              }, 3000);
              return;
            }
            
            // Handle validation errors
            if (createErr.response.status === 400) {
              setError(createErr.response.data.error || 'Please check your input and try again.');
              return;
            }
            
            throw new Error(createErr.response.data?.message || 'Failed to create article');
          } else if (createErr.request) {
            console.error('No response received:', createErr.request);
            throw new Error('No response from server. Please check your connection.');
          } else {
            throw createErr;
          }
        }
      }
    } catch (err) {
      console.error('Failed to save article:', err);
      let errorMessage = err.message || 'Failed to save article. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add a render section for loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <CircularProgress size={50} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              {isEditMode ? 'Loading Article...' : 'Processing...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait a moment.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Add improved error state display
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #f5c6cb' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <Alert 
              severity="error" 
              variant="outlined"
              sx={{ 
                width: '100%', 
                mb: 3,
                '& .MuiAlert-icon': {
                  fontSize: '2rem'
                }
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>Error Loading Article</Typography>
                <Typography variant="body2">{error}</Typography>
              </Box>
            </Alert>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />}
                component={RouterLink}
                to="/admin/dashboard"
              >
                Return to Dashboard
              </Button>
              <Button 
                variant="contained"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {isEditMode ? 'Edit Article' : 'Create New Article'}
            </Typography>
          </Box>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            error={!!validationErrors.title}
            helperText={validationErrors.title}
            required
          />
          
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={8}
            error={!!validationErrors.content}
            helperText={validationErrors.content}
            required
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" error={!!validationErrors.categoryId}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                  variant="outlined"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.title}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.categoryId && (
                  <FormHelperText>{validationErrors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" error={!!validationErrors.statusEnum}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="statusEnum"
                  value={formData.statusEnum}
                  onChange={handleChange}
                  label="Status"
                  variant="outlined"
                  required
                >
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                  <MenuItem value="COMING_SOON">Coming Soon</MenuItem>
                  <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                  <MenuItem value="RE_WRITE">Needs Rewrite</MenuItem>
                </Select>
                {validationErrors.statusEnum && (
                  <FormHelperText>{validationErrors.statusEnum}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Article Image
            </Typography>
            
            {imagePreview ? (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Card elevation={0} sx={{ maxWidth: 300, mx: 'auto' }}>
                  <CardMedia
                    component="img"
                    image={imagePreview.startsWith('http') ? imagePreview : `${API_URL}${imagePreview}`}
                    alt="Article preview"
                    sx={{ 
                      height: 200, 
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <IconButton 
                    color="error" 
                    onClick={handleRemoveImage}
                    size="small"
                    sx={{ 
                      bgcolor: 'error.light', 
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.main',
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <input
                  accept="image/*"
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Select Image
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Supported formats: JPEG, PNG, GIF (max 5MB)
                </Typography>
              </Box>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading: {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {isEditMode ? 'Update Article' : 'Create Article'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ArticleForm; 