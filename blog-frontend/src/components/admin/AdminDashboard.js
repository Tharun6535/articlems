import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  alpha,
  LinearProgress,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Bookmark as BookmarkIcon,
  Visibility as VisibilityIcon,
  FormatListBulleted as FormatListBulletedIcon
} from '@mui/icons-material';
import { getArticlesPaginated, getCategories, deleteArticle } from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, Legend } from 'recharts';

// Define colors for charts
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const BAR_COLORS = {
  PUBLISHED: '#2e7d32', // success.main
  COMING_SOON: '#ed6c02', // warning.main
  UNDER_REVIEW: '#0288d1', // info.main
  RE_WRITE: '#d32f2f' // error.main
};

const AdminDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // State
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    comingSoonArticles: 0,
    underReviewArticles: 0,
    rewriteArticles: 0,
    totalCategories: 0,
    articlesPerCategory: [],
    mostPopularArticles: [],
    recentActivity: []
  });
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);
        
        // Get categories
        const categoriesResponse = await getCategories();
        const categoriesData = categoriesResponse.data || [];
        setCategories(categoriesData);
        
        // Create category name mapping
        const catMap = {};
        categoriesData.forEach(cat => {
          catMap[cat.id] = cat.title;
        });
        setCategoryMap(catMap);
        
        // Get articles
        const articlesResponse = await getArticlesPaginated(0, 100, 'id', 'desc', '');
        const articlesData = articlesResponse.data.content || [];
        setArticles(articlesData);
        
        // Calculate stats
        calculateStats(articlesData, categoriesData);
        
        setLoading(false);
        setStatsLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
        setStatsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate stats from data
  const calculateStats = (articlesData, categoriesData) => {
    const totalArticles = articlesData.length;
    
    // Count articles by status
    const publishedArticles = articlesData.filter(a => a.statusEnum === 'PUBLISHED').length;
    const comingSoonArticles = articlesData.filter(a => a.statusEnum === 'COMING_SOON').length;
    const underReviewArticles = articlesData.filter(a => a.statusEnum === 'UNDER_REVIEW').length;
    const rewriteArticles = articlesData.filter(a => a.statusEnum === 'RE_WRITE').length;
    
    // Articles per category
    const articlesPerCategory = [];
    const categoryCount = {};
    
    articlesData.forEach(article => {
      if (article.categoryId) {
        if (categoryCount[article.categoryId]) {
          categoryCount[article.categoryId]++;
        } else {
          categoryCount[article.categoryId] = 1;
        }
      }
    });
    
    categoriesData.forEach(category => {
      articlesPerCategory.push({
        name: category.title,
        value: categoryCount[category.id] || 0
      });
    });
    
    // Most popular articles (using random like counts as proxy since we don't have real data)
    const articlesWithLikes = articlesData.map(article => ({
      ...article,
      likeCount: article.likeCount || Math.floor(Math.random() * 50)
    }));
    
    const mostPopularArticles = [...articlesWithLikes]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5);
    
    // Recent activity - just using the most recent articles as a proxy
    const recentActivity = [...articlesData]
      .sort((a, b) => new Date(b.createDateTime || 0) - new Date(a.createDateTime || 0))
      .slice(0, 10)
      .map(article => ({
        id: article.id,
        title: article.title,
        action: 'Created',
        date: article.createDateTime,
        type: 'article'
      }));
    
    setStats({
      totalArticles,
      publishedArticles,
      comingSoonArticles,
      underReviewArticles,
      rewriteArticles,
      totalCategories: categoriesData.length,
      articlesPerCategory,
      mostPopularArticles,
      recentActivity
    });
  };
  
  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={2} sx={{ padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="caption" sx={{ color: '#000' }}>
            {`${label || payload[0].name} : ${payload[0].value}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Handle action menu opening
  const handleOpenActionMenu = (event, articleId) => {
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedArticleId(articleId);
  };

  // Handle action menu closing
  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
    setSelectedArticleId(null);
  };

  // Handle delete article
  const handleDeleteArticle = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(selectedArticleId);
        // Update articles list
        setArticles(articles.filter(article => article.id !== selectedArticleId));
        // Update stats
        calculateStats(
          articles.filter(article => article.id !== selectedArticleId),
          categories
        );
      } catch (err) {
        console.error('Failed to delete article:', err);
        setError('Failed to delete article. Please try again.');
      }
    }
    handleCloseActionMenu();
  };

  // Get status color
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
        return <CheckCircleIcon color="success" />;
      case 'COMING_SOON':
        return <WarningIcon color="warning" />;
      case 'UNDER_REVIEW':
        return <InfoIcon color="info" />;
      case 'RE_WRITE':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };
  
  // Handle table pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Dashboard stat card component
  const StatCard = ({ title, value, icon, color, percent, secondaryText }) => (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          opacity: 0.1,
          transform: 'translate(30%, -30%)',
          borderRadius: '50%',
          bgcolor: `${color}.main`
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" color="textSecondary" fontWeight="medium" gutterBottom>
            {title}
          </Typography>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {percent !== undefined && (
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={percent} 
              color={color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
        {secondaryText && (
          <Typography variant="body2" color="textSecondary">
            {secondaryText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Paginated articles for table
  const paginatedArticles = articles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/add-article"
          >
            New Article
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ArticleIcon />}
            component={RouterLink}
            to="/import-csv"
          >
            Import CSV
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsLoading ? (
          <Grid item xs={12}><LinearProgress /></Grid>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Articles" 
                value={stats.totalArticles} 
                icon={<ArticleIcon color="primary" />} 
                color="primary.main" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Published" 
                value={stats.publishedArticles} 
                icon={<CheckCircleIcon color="success" />} 
                color="success.main"
                percent={stats.totalArticles > 0 ? ((stats.publishedArticles / stats.totalArticles) * 100).toFixed(0) + '%' : '0%'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Under Review / Coming Soon" 
                value={stats.underReviewArticles + stats.comingSoonArticles} 
                icon={<InfoIcon color="info" />} 
                color="info.main" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Needs Rewrite" 
                value={stats.rewriteArticles} 
                icon={<WarningIcon color="error" />} 
                color="error.main" 
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsLoading ? (
          <Grid item xs={12} md={6}><LinearProgress /></Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: 350 }}>
              <Typography variant="h6" gutterBottom>Articles per Category</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.articlesPerCategory.filter(item => item.value > 0)} // Filter out categories with 0 articles
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.articlesPerCategory.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
        
        {statsLoading ? (
          <Grid item xs={12} md={6}><LinearProgress /></Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: 350 }}>
              <Typography variant="h6" gutterBottom>Article Status Distribution</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: 'Published', count: stats.publishedArticles, fill: BAR_COLORS.PUBLISHED },
                    { name: 'Coming Soon', count: stats.comingSoonArticles, fill: BAR_COLORS.COMING_SOON },
                    { name: 'Under Review', count: stats.underReviewArticles, fill: BAR_COLORS.UNDER_REVIEW },
                    { name: 'Needs Rewrite', count: stats.rewriteArticles, fill: BAR_COLORS.RE_WRITE },
                  ]}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false}/>
                  <RechartTooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Recent Articles */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="medium">
            Recent Articles
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FormatListBulletedIcon />}
            component={RouterLink}
            to="/articles"
          >
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="articles table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedArticles.map((article) => (
                <TableRow
                  key={article.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        variant="rounded"
                        src={article.imagePath?.startsWith('http') 
                          ? article.imagePath 
                          : (article.imagePath ? `http://localhost:8081${article.imagePath}` : undefined)}
                        sx={{ 
                          mr: 2, 
                          width: 40, 
                          height: 40,
                          bgcolor: !article.imagePath ? theme.palette.primary.main : undefined
                        }}
                      >
                        {!article.imagePath && article.title.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        component={RouterLink}
                        to={`/articles/${article.id}`}
                        sx={{ 
                          color: 'inherit', 
                          textDecoration: 'none',
                          '&:hover': { color: theme.palette.primary.main }
                        }}
                      >
                        {article.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{categoryMap[article.categoryId] || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(article.statusEnum)}
                      label={article.statusEnum}
                      color={getStatusColor(article.statusEnum)}
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(article.createDateTime)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Article">
                        <IconButton
                          size="small"
                          component={RouterLink}
                          to={`/articles/${article.id}`}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Article">
                        <IconButton
                          component={RouterLink}
                          to={`/edit-article/${article.id}`}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Test Page">
                        <IconButton
                          component={RouterLink}
                          to={`/test-article/${article.id}`}
                          size="small"
                          color="success"
                        >
                          <ArticleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenActionMenu(e, article.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={articles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleCloseActionMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleDeleteArticle} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Article</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {stats.recentActivity.map((activity, index) => (
            <React.Fragment key={`${activity.type}-${activity.id}-${index}`}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  {activity.type === 'article' ? <ArticleIcon color="primary" /> : <CategoryIcon color="secondary" />}
                </ListItemIcon>
                <ListItemText
                  primary={activity.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {activity.action}
                      </Typography>
                      {' — '}{formatDate(activity.date)}
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 