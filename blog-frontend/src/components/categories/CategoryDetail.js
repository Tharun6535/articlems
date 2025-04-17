import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, Button, Card, CardContent, CardActions, Divider } from '@mui/material';
import { getCategoryById } from '../../services/api';
import { getArticles } from '../../services/api';
import AuthService from '../../services/auth.service';

const CategoryDetail = () => {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const isAdmin = AuthService.isAdmin();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the category details
        const categoryData = await getCategoryById(id);
        setCategory(categoryData.data);
        
        // Fetch articles for this category
        const articlesResponse = await getArticles();
        const categoryArticles = articlesResponse.data.filter(
          article => article.categoryId === parseInt(id, 10)
        );
        setArticles(categoryArticles);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load category details. ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Typography>Loading category details...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!category) return <Typography>Category not found</Typography>;

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            {category.title}
          </Typography>
          <Button component={Link} to="/categories" variant="outlined">
            Back to Categories
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Articles in this category
        </Typography>
        
        {articles.length === 0 ? (
          <Typography variant="body1">No articles found in this category.</Typography>
        ) : (
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} md={6} key={article.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {article.content.length > 150 
                        ? `${article.content.substring(0, 150)}...` 
                        : article.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} to={`/articles/${article.id}`}>
                      Read More
                    </Button>
                    {isAdmin && (
                      <Button size="small" component={Link} to={`/articles/edit/${article.id}`}>
                        Edit
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default CategoryDetail; 