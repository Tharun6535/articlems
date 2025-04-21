import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, Grid, Button, Paper, Card, CardContent, 
  CardMedia, Avatar, Chip, IconButton, Divider, useTheme, alpha, 
  Skeleton, useMediaQuery, CardActionArea
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  Bookmark as BookmarkIcon,
  ArrowForward as ArrowForwardIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

import { getArticlesPaginated } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, description, color }) => {
  const theme = useTheme();
  
  return (
    <Card 
      variant="outlined" 
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 30px ${alpha(color, 0.2)}`,
          borderColor: color
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '18px',
            bgcolor: alpha(color, 0.1),
            color: color,
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ArticleCard = ({ article }) => {
  const theme = useTheme();
  
  const getRandomColor = (id) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main
    ];
    return colors[(id || 1) % colors.length];
  };
  
  const getInitials = (title) => {
    if (!title) return 'AA';
    return title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };
  
  return (
    <Card 
      variant="outlined"
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme => `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: 'primary.main'
        }
      }}
    >
      <CardActionArea 
        component={RouterLink} 
        to={`/articles/${article.id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            height: 200,
            backgroundColor: getRandomColor(article.id)
          }}
        >
          {article.filename ? (
            <CardMedia
              component="img"
              image={`/uploads/${article.filename}`}
              alt={article.title}
              sx={{ height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
              }}
            >
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  color: '#fff', 
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontWeight: 700
                }}
              >
                {getInitials(article.title)}
              </Typography>
            </Box>
          )}
          <Chip
            label={article.statusEnum || 'PUBLISHED'}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: article.statusEnum === 'PUBLISHED' ? theme.palette.success.main : theme.palette.info.main,
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.7rem'
            }}
          />
        </Box>
        <CardContent sx={{ p: 3, flexGrow: 1 }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            {formatDate(article.created)}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}
          >
            {article.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.content ? article.content.substring(0, 150) + '...' : 'No content available'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await getArticlesPaginated(0, 3, 'id', 'desc');
        const articlesData = response.data.content || [];
        setArticles(articlesData);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section (plain background, no gradient/card) */}
      <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              Modern Content Management Platform
            </Typography>
            <Typography 
              variant="h6" 
        sx={{
          mb: 4,
                fontWeight: 400,
                opacity: 0.9,
                maxWidth: '90%'
              }}
            >
              Create, manage, and publish content with our intuitive platform designed for professional writers and content creators
        </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mt: 4
              }}
            >
          <Button
                component={RouterLink}
                to="/articles"
            variant="contained"
            color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '50px',
                  boxShadow: '0 8px 16px rgba(247, 37, 133, 0.08)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 20px rgba(247, 37, 133, 0.12)',
                  }
                }}
              >
                Explore Articles
              </Button>
              {user && (
                <Button
            component={RouterLink}
                  to="/article/add"
                  variant="outlined"
                  size="large"
                  color="inherit"
                  endIcon={<EditIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(67,97,238,0.04)',
                    }
                  }}
          >
                  Create New Article
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      {/* Features Section */}
      <Container maxWidth="xl">
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<EditIcon sx={{ fontSize: 30 }} />}
                title="Intuitive Editor"
                description="Create and edit content with our easy-to-use editor designed for writers and bloggers."
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<ViewListIcon sx={{ fontSize: 30 }} />}
                title="Content Organization"
                description="Organize your articles with categories, tags, and custom statuses for better workflow."
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<SearchIcon sx={{ fontSize: 30 }} />}
                title="Advanced Search"
                description="Find content quickly with powerful search capabilities and filtering options."
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<DashboardIcon sx={{ fontSize: 30 }} />}
                title="Admin Dashboard"
                description="Access analytics, manage users, and control all aspects of your content from one place."
                color={theme.palette.success.main}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Latest Articles Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700
              }}
            >
        Latest Articles
      </Typography>
            <Button 
              component={RouterLink} 
              to="/articles" 
              endIcon={<ArrowForwardIcon />}
              sx={{ fontWeight: 600 }}
            >
              View All
            </Button>
          </Box>

      {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item key={item} xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={35} sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
      ) : (
        <Grid container spacing={3}>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <Grid item key={article.id} xs={12} sm={6} md={4}>
                    <ArticleCard article={article} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="h6" gutterBottom>No articles found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start creating content to see your articles here
                    </Typography>
                    {user && (
                  <Button 
                    component={RouterLink} 
                        to="/article/add"
                        variant="contained"
                        startIcon={<EditIcon />}
                  >
                        Create New Article
                  </Button>
                    )}
                  </Paper>
            </Grid>
              )}
        </Grid>
      )}
        </Box>
        
        {/* Call to Action */}
        <Box 
          sx={{ 
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.primary.main, 0.9)})`,
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="white" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
              backgroundSize: '24px',
              opacity: 0.5,
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 700, mx: 'auto' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Ready to start creating content?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4,
                opacity: 0.9,
                fontWeight: 400
              }}
            >
              Join our platform today and start publishing your articles, stories, and ideas
            </Typography>
            {!user ? (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    boxShadow: '0 8px 16px rgba(247, 37, 133, 0.3)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 20px rgba(247, 37, 133, 0.4)',
                    }
                  }}
                >
                  Sign Up Free
                </Button>
          <Button
                  component={RouterLink}
                  to="/login"
            variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderWidth: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Login
                </Button>
              </Box>
            ) : (
              <Button
            component={RouterLink}
                to="/article/add"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<EditIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '50px',
                  boxShadow: '0 8px 16px rgba(247, 37, 133, 0.3)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 20px rgba(247, 37, 133, 0.4)',
                  }
                }}
              >
                Create New Article
          </Button>
            )}
          </Box>
        </Box>
    </Container>
    </Box>
  );
};

export default Home; 