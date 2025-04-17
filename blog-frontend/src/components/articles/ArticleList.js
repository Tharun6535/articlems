import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  CardMedia,
  Avatar,
  CardHeader,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  ButtonGroup,
  useMediaQuery,
  Fab,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  Comment as CommentIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getArticlesPaginated, getCategories } from '../../services/api';
import ExportMenu from '../common/ExportMenu';

const ArticleList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTab, setSelectedTab] = useState(0);
  const [categoryMap, setCategoryMap] = useState({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [likedArticles, setLikedArticles] = useState({});

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      console.log('Categories response:', response);
      const categoriesData = response.data || [];
      setCategories(categoriesData);
      
      // Create a mapping of category IDs to names for easier lookup
      const mapping = {};
      categoriesData.forEach(category => {
        mapping[category.id] = category.title;
      });
      setCategoryMap(mapping);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  // Updated fetchArticles to use useCallback for stability
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Only send supported sort fields to the API
      const apiSortField = sortField === 'likes' ? 'id' : sortField;
      
      const response = await getArticlesPaginated(page, size, apiSortField, sortDirection, searchTitle);
      console.log('API Response:', response);
      
      let articlesData = response.data.content || [];
      const totalElements = response.data.totalElements || 0;
      
      // Filter by status if not showing all
      const filterStatus = getFilterByTab(selectedTab);
      if (filterStatus) {
        articlesData = articlesData.filter(article => article.statusEnum === filterStatus);
      }
      
      // Get liked articles from localStorage
      const storedLikedArticles = JSON.parse(localStorage.getItem('likedArticles') || '{}');
      setLikedArticles(storedLikedArticles);
      
      // Add like counts to articles (in a real app this would come from backend)
      articlesData = articlesData.map(article => ({
        ...article,
        likeCount: article.likeCount || Math.floor(Math.random() * 50), // Using random as placeholder
        isLiked: !!storedLikedArticles[article.id]
      }));
      
      // Sort by likes if sortField is 'likes' (do this locally instead of API)
      if (sortField === 'likes') {
        articlesData.sort((a, b) => {
          return sortDirection === 'desc' 
            ? b.likeCount - a.likeCount
            : a.likeCount - b.likeCount;
        });
      }
      
      setArticles(articlesData);
      setTotal(totalElements);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      const userMessage = err.userMessage || 'Failed to load articles. Please try again later.';
      setError(userMessage);
      setArticles([]); // Clear articles on error
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortField, sortDirection, searchTitle, selectedTab]); // Dependencies for useCallback
  
  const getFilterByTab = (tabIndex) => {
    switch(tabIndex) {
      case 0: return null; // All
      case 1: return 'PUBLISHED';
      case 2: return 'COMING_SOON';
      case 3: return 'UNDER_REVIEW';
      case 4: return 'RE_WRITE';
      default: return null;
    }
  };

  useEffect(() => {
    // Fetch both articles and categories when component mounts or dependencies change
    fetchArticles();
    if (categories.length === 0) {
    fetchCategories();
    }
  }, [fetchArticles, categories.length]); // Use fetchArticles from useCallback

  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchArticles(); // fetchArticles now uses searchTitle state
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTitle('');
    setPage(0);
    // No need to call fetchArticles here, useEffect will trigger
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1); // MUI Pagination is 1-based, but our API is 0-based
  };

  const handleChangeSize = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing size
  };
  
  const handleChangeViewMode = (mode) => {
    setViewMode(mode);
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0); // Reset to first page when changing tab
  };

  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(0); // Reset page on sort change
  };

  const handleToggleLike = (articleId) => {
    const newLikedArticles = { ...likedArticles };
    const isCurrentlyLiked = newLikedArticles[articleId];
    
    if (isCurrentlyLiked) {
      delete newLikedArticles[articleId];
    } else {
      newLikedArticles[articleId] = true;
    }
    
    // Update localStorage
    localStorage.setItem('likedArticles', JSON.stringify(newLikedArticles));
    setLikedArticles(newLikedArticles);
    
    // Update articles in state
    setArticles(prev => 
      prev.map(article => {
        if (article.id === articleId) {
          const newLikeCount = article.likeCount + (isCurrentlyLiked ? -1 : 1);
          return {
            ...article,
            likeCount: newLikeCount,
            isLiked: !isCurrentlyLiked
          };
        }
        return article;
      })
    );
    
    // In a real application, you would also send this update to the backend
    // Example: updateArticleLike(articleId, !isCurrentlyLiked);
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircleIcon fontSize="inherit" />;
      case 'COMING_SOON':
        return <WarningIcon fontSize="inherit" />;
      case 'UNDER_REVIEW':
        return <InfoIcon fontSize="inherit" />;
      case 'RE_WRITE':
        return <ErrorIcon fontSize="inherit" />;
      default:
        return <InfoIcon fontSize="inherit" />;
    }
  };
  
  const getRandomColor = (id) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b'];
    return colors[id % colors.length];
  };
  
  const getInitials = (title) => {
    if (!title) return '?';
    return title.charAt(0).toUpperCase();
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Configure columns for export
  const exportColumns = [
    { title: 'ID', dataKey: 'id' },
    { title: 'Title', dataKey: 'title' },
    { title: 'Status', dataKey: 'statusEnum' },
    { title: 'Category', dataKey: 'categoryName' },
    { title: 'Created Date', dataKey: 'createdDate' },
    { title: 'Likes', dataKey: 'likeCount' }
  ];

  // Prepare data for export
  const getExportData = () => {
    return articles.map(article => ({
      ...article,
      categoryName: categoryMap[article.categoryId] || 'Unknown',
      createdDate: formatDate(article.createDateTime),
      likeCount: article.likeCount // Ensure likeCount is included
    }));
  };

  const renderSkeletons = (count, mode) => (
    Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={mode === 'grid' ? 4 : 12} key={`skeleton-${index}`}>
        <Card sx={{ display: 'flex', flexDirection: mode === 'list' ? 'row' : 'column', height: '100%' }}>
          <Skeleton variant="rectangular" sx={{ width: mode === 'list' ? 150 : '100%', height: mode === 'list' ? '100%' : 140 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: mode === 'list' ? 2 : 0 }}>
            <CardHeader
              avatar={<Skeleton variant="circular" width={40} height={40} />}
              title={<Skeleton variant="text" sx={{ fontSize: '1rem' }} />} 
              subheader={<Skeleton variant="text" width="40%" />} 
              sx={{ pt: mode === 'grid' ? 2 : 0, pb: 0 }}
            />
            <CardContent sx={{ flexGrow: 1, pt: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Skeleton variant="circular" width={30} height={30} />
              <Skeleton variant="circular" width={30} height={30} />
            </CardActions>
          </Box>
        </Card>
      </Grid>
    ))
  );

  const sortOptions = [
    { value: 'id,desc', label: 'Newest First' },
    { value: 'id,asc', label: 'Oldest First' },
    { value: 'title,asc', label: 'Title (A-Z)' },
    { value: 'title,desc', label: 'Title (Z-A)' },
    { value: 'likeCount,desc', label: 'Most Liked' },
    { value: 'likeCount,asc', label: 'Least Liked' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Articles
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ExportMenu columns={exportColumns} data={getExportData()} filename="articles" />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/add-article"
          >
            Create Article
          </Button>
        </Stack>
      </Box>
      
      {/* Filters and Controls Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
          <TextField
              label="Search by Title"
            variant="outlined"
              fullWidth
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
              size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon color={isSearchFocused ? "primary" : "action"} />
                </InputAdornment>
              ),
              endAdornment: searchTitle && (
                <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon />
                  </IconButton>
                </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="sort-field-label">Sort By</InputLabel>
              <Select
                labelId="sort-field-label"
                value={sortField}
                onChange={(e) => handleSort(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="id">Date (Newest)</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="likes">Popularity</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title={sortDirection === 'asc' ? "Ascending" : "Descending"}>
              <IconButton onClick={() => handleSort(sortField)} color="primary">
                <SortIcon sx={{ transform: sortDirection === 'asc' ? 'rotate(180deg)' : 'none' }}/>
              </IconButton>
            </Tooltip>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Grid View">
                <Button onClick={() => handleChangeViewMode('grid')} variant={viewMode === 'grid' ? 'contained' : 'outlined'}>
                  <ViewModuleIcon />
              </Button>
              </Tooltip>
              <Tooltip title="List View">
                <Button onClick={() => handleChangeViewMode('list')} variant={viewMode === 'list' ? 'contained' : 'outlined'}>
                  <ViewListIcon />
              </Button>
              </Tooltip>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Article status tabs"
        >
          <Tab label="All" />
          <Tab label="Published" />
          <Tab label="Coming Soon" />
          <Tab label="Under Review" />
          <Tab label="Re-write" />
          </Tabs>
        </Box>

      {/* Error Alert */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Article Grid or List */}
      <Grid container spacing={3}>
        {loading 
          ? renderSkeletons(size, viewMode) 
          : articles.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No articles found matching your criteria.</Alert>
              </Grid>
            ) : (
              articles.map((article) => (
                <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={article.id}>
          {viewMode === 'grid' ? (
                    // Grid View Card
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}>
                      <CardMedia
                        component="img"
                        sx={{ height: 200, objectFit: 'cover' }}
                        image={article.imagePath || `/images/placeholder-${(article.id % 5) + 1}.jpg`}
                        alt={article.title}
                      />
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: getRandomColor(article.id) }}>
                            {getInitials(article.title)}
                          </Avatar>
                        }
                        title={
                          <Typography 
                            variant="subtitle2"
                            sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {article.title}
                          </Typography>
                        }
                        subheader={
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(article.createDateTime)}
                          </Typography>
                        }
                        action={
                      <Chip 
                            icon={getStatusIcon(article.statusEnum)}
                        label={article.statusEnum} 
                        size="small" 
                        color={getStatusColor(article.statusEnum)}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        }
                        sx={{ pb: 0 }}
                      />
                      <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        lineHeight: 1.4,
                        height: '4.2em',
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                      }}>
                        {article.content}
                      </Typography>
                        <Chip 
                          icon={<CategoryIcon fontSize="small" />}
                          label={categoryMap[article.categoryId] || 'Unknown'}
                          size="small" 
                          variant="outlined"
                        />
                      </CardContent>
                      <Divider light />
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                        <Tooltip title="View Comments">
                          <Button 
                              size="small"
                            startIcon={<CommentIcon />}
                            component={RouterLink} 
                            to={`/articles/${article.id}`}
                            sx={{ color: 'text.secondary' }}
                          >
                            {article.commentCount || 0}
                          </Button>
                          </Tooltip>
                        <Tooltip title={likedArticles[article.id] ? 'Unlike' : 'Like'}>
                          <Button 
                              size="small"
                              onClick={() => handleToggleLike(article.id)}
                            startIcon={likedArticles[article.id] ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            sx={{ color: likedArticles[article.id] ? 'error.main' : 'text.secondary' }}
                          >
                            {article.likeCount}
                          </Button>
                          </Tooltip>
                        <Tooltip title="Read More">
                        <Button
                            size="small" 
                            endIcon={<VisibilityIcon />}
                          component={RouterLink} 
                          to={`/articles/${article.id}`}
                        >
                            View
                        </Button>
                        </Tooltip>
                    </CardActions>
                  </Card>
                  ) : (
                    // List View Card
                    <Card sx={{ display: 'flex', borderRadius: 2, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 3px 15px rgba(0,0,0,0.08)' } }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: 120, objectFit: 'cover' }} // Fixed size for list view
                        image={article.imagePath || `/images/placeholder-${(article.id % 5) + 1}.jpg`} // Use placeholder if no image
                          alt={article.title}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          component={RouterLink}
                          to={`/articles/${article.id}`}
                          sx={{ 
                            fontWeight: 'bold',
                            color: 'text.primary',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' },
                            mr: 1
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Chip 
                              icon={getStatusIcon(article.statusEnum)}
                          label={article.statusEnum} 
                          size="small" 
                          color={getStatusColor(article.statusEnum)}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 1,
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                        }}
                      >
                        {article.content}
                      </Typography>
                      
                          <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                        <Chip 
                              icon={<CategoryIcon fontSize="small" />}
                              label={categoryMap[article.categoryId] || 'Unknown'}
                          size="small" 
                          variant="outlined"
                        />
                          <Chip
                              icon={<AccessTimeIcon fontSize="small" />}
                              label={formatDate(article.createDateTime)}
                            size="small"
                            variant="outlined"
                            />
                          </Stack>
                        </Box>
                        <CardActions sx={{ alignSelf: 'flex-end', p: 0, mt: 1 }}>
                          <Tooltip title="View Comments">
                            <IconButton size="small" component={RouterLink} to={`/articles/${article.id}`}>
                              <CommentIcon fontSize="small"/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={likedArticles[article.id] ? 'Unlike' : 'Like'}>
                            <IconButton size="small" onClick={() => handleToggleLike(article.id)}>
                              {likedArticles[article.id] ? <FavoriteIcon color="error" fontSize="small"/> : <FavoriteBorderIcon fontSize="small"/>}
                            </IconButton>
                        </Tooltip>
                          <Tooltip title="View Article">
                            <IconButton size="small" component={RouterLink} to={`/articles/${article.id}`}>
                              <VisibilityIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                        </CardActions>
                      </Box>
                    </Card>
                  )}
                </Grid>
              ))
            )}
      </Grid>

      {/* Pagination Controls */}
      {total > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {articles.length} of {total} articles
          </Typography>
            <Pagination 
              count={Math.ceil(total / size)} 
              page={page + 1} 
              onChange={handleChangePage} 
              color="primary" 
            shape="rounded"
              showFirstButton 
              showLastButton
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
            <InputLabel id="items-per-page-label">Size</InputLabel>
            <Select
              labelId="items-per-page-label"
              value={size}
              onChange={handleChangeSize}
              label="Size"
            >
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
            </Select>
          </FormControl>
          </Box>
      )}
      
      {/* FAB for adding articles on mobile */}
      {isMobile && (
        <Fab 
          color="primary" 
          aria-label="add article" 
          component={RouterLink} 
          to="/add-article"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default ArticleList; 