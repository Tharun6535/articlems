import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Typography, 
  Alert, 
  Paper, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Article as ArticleIcon,
  Info as InfoIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { uploadCsv } from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';

const CsvImporter = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadCsv(file);
      console.log('CSV import response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Failed to import CSV:', err);
      setError(
        (err.response && err.response.data && err.response.data.error) ||
        'Failed to import CSV. Please check your file format and try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    // Create a simpler CSV content that definitely works
    const csvContent = 
`ID,Title,Status,Category,Created Date,Likes
1,Sample Article Title,PUBLISHED,Technology,2023-01-01,0
2,Another Example Article,DRAFT,Science,2023-01-02,5`;
    
    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'article_template.csv');
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Button
        variant="outlined"
        component={RouterLink}
        to="/admin"
        sx={{ mb: 3 }}
      >
        Back to Admin Dashboard
      </Button>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Import Articles from CSV
        </Typography>
        
        <Typography variant="body1" paragraph>
          Upload a CSV file with article data to bulk import articles.
        </Typography>
        
        <Card sx={{ mb: 3, bgcolor: '#f9f9f9' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              CSV Format Requirements
            </Typography>
            <Typography variant="body2" component="div">
              Your CSV file should have the following columns:
              <ul>
                <li><strong>ID</strong> - An identifier (not required, will be assigned by the system)</li>
                <li><strong>Title</strong> (required) - The article title</li>
                <li><strong>Status</strong> (required) - The article status (DRAFT, PUBLISHED, etc.)</li>
                <li><strong>Category</strong> (required) - The category name (will be created if it doesn't exist)</li>
                <li><strong>Created Date</strong> (optional) - Date when article was created</li>
                <li><strong>Likes</strong> (optional) - Number of likes</li>
              </ul>
              The first row should be a header row. Values may be enclosed in quotes.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Select CSV File
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          
          {file && (
            <Typography variant="body2">
              Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Import Articles'}
        </Button>
      </Paper>
      
      {result && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Import Results
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography>
              Successfully imported {result.successCount} of {result.totalCount} articles
            </Typography>
          </Box>
          
          {result.errors && result.errors.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="error" gutterBottom>
                Errors ({result.errors.length})
              </Typography>
              <List dense>
                {result.errors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/articles"
              startIcon={<ArticleIcon />}
            >
              View Articles
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              startIcon={<InfoIcon />}
            >
              Import Another File
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default CsvImporter; 