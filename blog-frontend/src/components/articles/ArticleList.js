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
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon
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
  const [animateCards, setAnimateCards] = useState(true);

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
      const apiSortField = sortField === 'id' ? 'id' : sortField;
      
      const response = await getArticlesPaginated(page, size, apiSortField, sortDirection, searchTitle);
      console.log('API Response:', response);
      
      let articlesData = response.data.content || [];
      const totalElements = response.data.totalElements || 0;
      
      // Filter by status if not showing all
      const filterStatus = getFilterByTab(selectedTab);
      if (filterStatus) {
        articlesData = articlesData.filter(article => article.statusEnum === filterStatus);
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
    { title: 'Created Date', dataKey: 'createdDate' }
  ];

  // Prepare data for export
  const getExportData = () => {
    return articles.map(article => ({
      ...article,
      categoryName: categoryMap[article.categoryId] || 'Unknown',
      createdDate: formatDate(article.createDateTime)
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
    { value: 'title,desc', label: 'Title (Z-A)' }
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
            to="/article/add"
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
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="stretch">
          {articles.map((article, index) => (
            <Grid 
              item 
              key={article.id} 
              xs={12} 
              sm={viewMode === 'list' ? 12 : 6} 
              md={viewMode === 'list' ? 12 : 4}
              lg={viewMode === 'list' ? 12 : 4}
              sx={{
                display: 'flex',
                height: 360,
                opacity: animateCards ? 1 : 0,
                transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.3s ease-out ${index * 0.1}s`
              }}
            >
              <Card 
                variant="outlined"
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: viewMode === 'list' ? 'row' : 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme => `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    position: 'relative',
                    width: viewMode === 'list' ? { xs: 120, sm: 180 } : '100%',
                    height: viewMode === 'list' ? 'auto' : 180,
                    flexShrink: 0,
                    backgroundColor: getRandomColor(article.id)
                  }}
                >
                  {article.imagePath ? (
                    <CardMedia
                      component="img"
                      image={
                        article.imagePath.startsWith('http')
                          ? article.imagePath
                          : article.imagePath.startsWith('/api/upload/files/')
                            ? `${window.location.origin}${article.imagePath}`
                            : article.imagePath.startsWith('/api')
                              ? `${window.location.origin}/api${article.imagePath.substring(4)}`
                              : article.imagePath.startsWith('/')
                                ? `${window.location.origin}${article.imagePath}`
                                : `${window.location.origin}/api/upload/files/${article.imagePath}`
                      }
                      alt={article.title}
                      sx={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189dc1d4c4c%20text%20%7B%20fill%3A%23777%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189dc1d4c4c%22%3E%3Crect%20width%3D%22800%22%20height%3D%22180%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22276.9749984741211%22%20y%3D%22100%22%3EArticle%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                      }}
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
                    label={article.statusEnum}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: getStatusColor(article.statusEnum),
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: '0.7rem'
                    }}
                    icon={getStatusIcon(article.statusEnum)}
                  />
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1,
                    justifyContent: 'space-between',
                    minHeight: 0
                  }}
                >
                  <CardContent sx={{ p: viewMode === 'list' ? 2 : 3, flexGrow: 1, minHeight: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      {article.categoryId && categoryMap[article.categoryId] && (
                        <Chip
                          icon={<CategoryIcon fontSize="small" />}
                          label={categoryMap[article.categoryId]}
                          size="small"
                          sx={{ 
                            mb: 1.5,
                            fontWeight: 500,
                            borderRadius: '8px',
                            bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main'
                          }}
                        />
                      )}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {formatDate(article.created)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      component={RouterLink} 
                      to={`/articles/${article.id}`}
                      sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        textDecoration: 'none',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '3.2em',
                        maxHeight: '3.2em',
                        lineHeight: '1.6em',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'none'
                        }
                      }}
                    >
                      {article.title}
                    </Typography>
                    {viewMode === 'list' && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.4em',
                          maxHeight: '2.4em',
                          lineHeight: '1.2em'
                        }}
                      >
                        {article.content && article.content.substring(0, 150)}...
                      </Typography>
                    )}
                    {viewMode !== 'list' && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '3.6em',
                          maxHeight: '3.6em',
                          lineHeight: '1.2em'
                        }}
                      >
                        {article.content && article.content.substring(0, 180)}...
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions 
                    sx={{ 
                      px: viewMode === 'list' ? 2 : 3, 
                      py: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      justifyContent: 'flex-end',
                      minHeight: 56
                    }}
                  >
                    <Button 
                      component={RouterLink}
                      to={`/articles/${article.id}`}
                      size="small"
                      endIcon={<ChevronRightIcon />}
                      sx={{ 
                        fontWeight: 600,
                        '&:hover': {
                          background: theme => alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      Read
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={Math.ceil(total / size)} 
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
            showFirstButton
            showLastButton
            size={isMobile ? "small" : "medium"}
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '10px',
                mx: 0.5
              }
            }}
          />
        </Box>
      </Box>

      {/* FAB for adding articles on mobile */}
      {isMobile && (
        <Fab 
          color="primary" 
          aria-label="add article" 
          component={RouterLink} 
          to="/article/add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default ArticleList; 