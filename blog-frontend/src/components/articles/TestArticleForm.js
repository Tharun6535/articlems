import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button 
} from '@mui/material';

const TestArticleForm = () => {
  const { id } = useParams();
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Article Form
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body1">
            Article ID from URL: <strong>{id || 'No ID found'}</strong>
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained"
            component={Link}
            to="/admin/dashboard"
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestArticleForm; 