import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getArticleById, deleteArticle, getCommentsByArticleId, createComment, deleteComment, getCategories } from '../../services/api';
import { alpha } from '@mui/material/styles';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [category, setCategory] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      try {
        setLoading(true);
        console.log("Fetching article with ID:", id);
        
        // Fetch article data
        const articleResponse = await getArticleById(id);
        console.log("Article response:", articleResponse);
        
        if (!articleResponse || !articleResponse.data) {
          throw new Error("No article data received");
        }
        
        const articleData = articleResponse.data;
        setArticle(articleData);
        
        // Check if article is liked from localStorage
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');
        setLiked(!!likedArticles[id]);
        
        // Set initial like count - in a real app this would come from the backend
        setLikeCount(articleData.likeCount || Math.floor(Math.random() * 50)); // Using random as placeholder
        
        // Fetch categories to display category name
        if (articleData.categoryId) {
          try {
            const categoriesResponse = await getCategories();
            const categories = categoriesResponse.data || [];
            const foundCategory = categories.find(cat => cat.id === articleData.categoryId);
            setCategory(foundCategory);
          } catch (catErr) {
            console.error('Failed to fetch category:', catErr);
          }
        }
        
        // Fetch comments
        try {
          const commentsResponse = await getCommentsByArticleId(id);
          console.log("Comments response:", commentsResponse);
          setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : []);
        } catch (commentErr) {
          console.error('Failed to fetch comments:', commentErr);
          setComments([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndComments();
  }, [id]);

  const handleToggleLike = () => {
    // Get current liked articles from localStorage
    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');
    
    // Toggle like status
    const newLiked = !liked;
    setLiked(newLiked);
    
    // Update like count
    const newLikeCount = likeCount + (newLiked ? 1 : -1);
    setLikeCount(newLikeCount);
    
    // Update localStorage
    if (newLiked) {
      likedArticles[id] = true;
    } else {
      delete likedArticles[id];
    }
    
    localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
    
    // In a real application, you would also send this update to the backend
    // Example: updateArticleLike(id, newLiked);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    try {
      const commentData = {
        articleComment: newComment,
        articleId: parseInt(id)
      };
      
      const response = await createComment(commentData);
      const addedComment = response.data || {};
      
      setComments(prevComments => [...prevComments, addedComment]);
      setNewComment('');
      setCommentError(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
      const errorMessage = 
        (err.response && err.response.data && err.response.data.message) || 
        'Failed to add comment. Please try again.';
      setCommentError(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (err) {
        console.error('Failed to delete comment:', err);
        setCommentError('Failed to delete comment. Please try again.');
      }
    }
  };

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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/articles"
          sx={{ mt: 2 }}
        >
          Back to Articles
        </Button>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Article not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to="/articles"
        sx={{ mb: 2 }}
      >
        Back to Articles
      </Button>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative' 
        }}
      >
        {/* Display the article image */}
        {article.imagePath && (
          <Box sx={{ 
            height: '300px', 
            width: '100%',
            mb: 3,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <img 
              src={article.imagePath.startsWith('http') 
                ? article.imagePath 
                : article.imagePath.startsWith('/api/upload/files/') 
                  ? `${window.location.origin}${article.imagePath}` // Use full URL with origin
                  : article.imagePath.startsWith('/api')
                    ? `${window.location.origin}/api${article.imagePath.substring(4)}`
                    : article.imagePath.startsWith('/') 
                      ? `${window.location.origin}${article.imagePath}`
                      : `${window.location.origin}/api/upload/files/${article.imagePath}`
              }
              alt={article.title}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error('Image failed to load:', article.imagePath);
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189dc1d4c4c%20text%20%7B%20fill%3A%23777%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189dc1d4c4c%22%3E%3Crect%20width%3D%22800%22%20height%3D%22300%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22276.9749984741211%22%20y%3D%22167.35999965667726%22%3EArticle%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
              }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#333',
            textShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
          }}>
            {article.title}
          </Typography>
          <Chip
            label={article.statusEnum || 'DRAFT'}
            color={getStatusColor(article.statusEnum)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{ mr: 0.5, color: 'primary.main' }} />
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}>
              {category ? category.title : `ID: ${article.categoryId || 'None'}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ mr: 0.5, color: 'primary.main' }} />
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}>
              {article.createDateTime ? new Date(article.createDateTime).toLocaleString() : 'Unknown date'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={liked ? "Unlike this article" : "Like this article"}>
              <IconButton 
                color={liked ? "primary" : "default"} 
                onClick={handleToggleLike}
                sx={{ 
                  p: 0.5,
                  color: liked ? theme.palette.error.main : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'inherit')
                }}
              >
                {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'} sx={{ ml: 0.5 }}>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ mr: 0.5, color: 'primary.main' }} />
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'inherit' }} />
        
        <Typography 
          variant="body1" 
          paragraph 
          sx={{ 
            lineHeight: 1.9, 
            fontSize: '1.05rem',
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : '#444',
            whiteSpace: 'pre-line',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            letterSpacing: '0.01em',
            textAlign: 'justify',
            '& ::selection': {
              backgroundColor: theme.palette.primary.main,
              color: 'white'
            }
          }}
        >
          {article.content}
        </Typography>
      </Paper>

      <Typography variant="h5" component="h2" sx={{ 
        fontWeight: 600, 
        mb: 2, 
        mt: 4,
        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : 'inherit'
      }}>
        Comments
      </Typography>

      <Card sx={{ 
        mb: 4, 
        borderRadius: 2, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : theme.palette.background.paper
      }}>
        <CardContent>
          <TextField
            label="Add a comment"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            error={!!commentError}
            helperText={commentError}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleAddComment}
            >
              Add Comment
            </Button>
          </Box>
        </CardContent>
      </Card>

      {comments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>No comments yet. Be the first to comment!</Alert>
      ) : (
        <List sx={{ p: 0 }}>
          {comments.map((comment) => (
            <ListItem
              key={comment.id}
              alignItems="flex-start"
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                mb: 2, 
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                p: 2
              }}
            >
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {comment.articleComment?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ mb: 1 }}>{comment.articleComment}</Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {comment.createDateTime 
                      ? new Date(comment.createDateTime).toLocaleString() 
                      : 'Date not available'}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default ArticleDetail; 