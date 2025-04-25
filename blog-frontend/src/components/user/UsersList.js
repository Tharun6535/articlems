import UserService from '../../services/user.service';
import { maskEmail } from '../../utils/formatUtils';

// Define columns for the data grid
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'username', headerName: 'Username', width: 130 },
  { 
    field: 'email', 
    headerName: 'Email', 
    width: 200,
    renderCell: (params) => maskEmail(params.value)
  },
  // ... existing code ...
]; 