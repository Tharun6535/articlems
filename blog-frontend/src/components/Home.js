import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import { getArticles } from '../services/api';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await getArticles();
        // Only show published articles on the home page
        const publishedArticles = data.filter(article => article.statusEnum === 'PUBLISHED');
        // Sort by create date (newest first) and limit to 6
        const sortedArticles = publishedArticles
          .sort((a, b) => new Date(b.createDateTime) - new Date(a.createDateTime))
          .slice(0, 6);
        
        setArticles(sortedArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'COMING_SOON':
        return 'warning';
      case 'UNDER_REVIEW':
        return 'info';
      case 'RE_WRITE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          backgroundImage: 'linear-gradient(135deg, #4A69DE 0%, #1976D2 100%)',
          color: 'white',
          borderRadius: 2,
        }}
        elevation={3}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Blog Platform
        </Typography>
        <Typography variant="h6" paragraph>
          A simple and elegant platform for managing articles, categories, and comments.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to="/articles"
            sx={{ mr: 2, color: 'white' }}
          >
            Browse Articles
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/add-article"
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Write an Article
          </Button>
        </Box>
      </Paper>

      <Typography variant="h4" component="h2" gutterBottom>
        Latest Articles
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {article.title}
                    </Typography>
                    <Chip 
                      label={article.statusEnum} 
                      size="small" 
                      color={getStatusColor(article.statusEnum)} 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {article.content.length > 120
                      ? `${article.content.substring(0, 120)}...`
                      : article.content}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {article.createDateTime 
                      ? new Date(article.createDateTime).toLocaleDateString() 
                      : 'Date not available'}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    component={RouterLink} 
                    to={`/articles/${article.id}`}
                  >
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {articles.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/articles"
          >
            View All Articles
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Home; 