import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TableSortLabel,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { getCategoriesPaginated, createCategory, updateCategory, deleteCategory } from '../../services/api';
import ExportMenu from '../common/ExportMenu';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, title: '' });
  const [validationError, setValidationError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesPaginated(page, size, sortField, sortDirection);
      // Check if response has content for paginated results
      const categoriesData = response.data && response.data.content ? response.data.content : [];
      setCategories(categoriesData);
      setTotal(response.data.totalElements || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Use the user-friendly error message if available
      const errorMessage = err.userMessage || 'Failed to load categories. Please try again later.';
      setError(errorMessage);
      // Set categories to empty array to avoid map error
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, size, sortField, sortDirection]);

  const handleOpenDialog = (category = { id: null, title: '' }) => {
    setCurrentCategory(category);
    setValidationError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setCurrentCategory({
      ...currentCategory,
      title: e.target.value,
    });
    setValidationError('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1); // MUI Pagination is 1-based, but our API is 0-based
  };

  const handleChangeSize = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing size
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
  };

  const handleSave = async () => {
    if (!currentCategory.title.trim()) {
      setValidationError('Title is required');
      return;
    }

    try {
      if (currentCategory.id) {
        // Update existing category
        await updateCategory(currentCategory.id, currentCategory);
      } else {
        // Create new category
        await createCategory(currentCategory);
      }
      handleCloseDialog();
      fetchCategories(); // Refresh the list after save
    } catch (err) {
      console.error('Failed to save category:', err);
      const errorMessage = 
        (err.response && err.response.data && err.response.data.message) || 
        `Failed to ${currentCategory.id ? 'update' : 'create'} category. Please try again.`;
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        // Refresh categories to ensure we have accurate data
        fetchCategories();
      } catch (err) {
        console.error('Failed to delete category:', err);
        const errorMessage = 
          (err.response && err.response.data && err.response.data.message) || 
          'Failed to delete category. Please try again.';
        setError(errorMessage);
      }
    }
  };

  // Configure columns for export
  const exportColumns = [
    { title: 'ID', dataKey: 'id' },
    { title: 'Title', dataKey: 'title' },
    { title: 'Articles Count', dataKey: 'articlesCount' },
    { title: 'Created Date', dataKey: 'createdDate' }
  ];

  // Prepare data for export with counting the related articles
  const getExportData = () => {
    return categories.map(category => ({
      ...category,
      articlesCount: 'N/A', // Replace with actual count if you have this data
      createdDate: new Date().toLocaleDateString() // Use actual date if available
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Categories
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ExportMenu
              data={getExportData()}
              columns={exportColumns}
              filename="blog-categories"
              title="Blog Categories"
              additionalInfo={{
                'Total Categories': categories.length,
                'Export Date': new Date().toLocaleDateString()
              }}
              buttonText="Export Categories"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">Sort by:</Typography>
            <Button 
              size="small" 
              startIcon={<SortIcon />} 
              onClick={() => handleSort('title')}
              variant={sortField === 'title' ? 'contained' : 'outlined'}
              color={sortField === 'title' ? 'primary' : 'inherit'}
            >
              Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              size="small" 
              startIcon={<SortIcon />} 
              onClick={() => handleSort('id')}
              variant={sortField === 'id' ? 'contained' : 'outlined'}
              color={sortField === 'id' ? 'primary' : 'inherit'}
            >
              ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
          </Stack>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="items-per-page-label">Items per page</InputLabel>
            <Select
              labelId="items-per-page-label"
              value={size}
              onChange={handleChangeSize}
              label="Items per page"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Alert severity="info">No categories found.</Alert>
      ) : (
        <>
          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Updated Date</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow 
                      key={category.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          transition: 'background-color 0.2s'
                        } 
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={category.id} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{category.title}</Typography>
                      </TableCell>
                      <TableCell>
                        {category.createDateTime 
                          ? new Date(category.createDateTime).toLocaleString() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {category.updateDateTime 
                          ? new Date(category.updateDateTime).toLocaleString() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Category">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(category)}
                            aria-label="edit"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(category.id)}
                            aria-label="delete"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={Math.ceil(total / size)} 
              page={page + 1} 
              onChange={handleChangePage} 
              color="primary" 
              showFirstButton 
              showLastButton
              size="large"
            />
          </Box>
        </>
      )}

      {/* Dialog for adding/editing category */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {currentCategory.id ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Title"
            type="text"
            fullWidth
            value={currentCategory.title}
            onChange={handleChange}
            error={!!validationError}
            helperText={validationError}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryList; 