import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableView as CsvIcon,
} from '@mui/icons-material';
import { exportToPdf, exportToCsv } from '../../utils/ExportUtils';

/**
 * Reusable export menu component for exporting data in different formats
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - The data to be exported
 * @param {Array} props.columns - Column definitions with title and dataKey
 * @param {string} props.filename - Base filename for the exported file (without extension)
 * @param {string} props.title - Title of the export
 * @param {Object} props.additionalInfo - Additional information to include in the export
 * @param {string} props.buttonText - Text for the export button
 * @param {Object} props.buttonProps - Additional props for the button
 */
const ExportMenu = ({ 
  data = [], 
  columns = [], 
  filename = 'export',
  title = 'Data Export',
  additionalInfo = {},
  buttonText = 'Export',
  buttonProps = {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleExport = (format) => {
    handleClose();
    
    if (format === 'pdf') {
      exportToPdf({
        data,
        columns,
        filename: `${filename}.pdf`,
        title,
        additionalInfo
      });
    } else if (format === 'csv') {
      exportToCsv({
        data,
        columns,
        filename: `${filename}.csv`
      });
    }
  };
  
  return (
    <>
      <Button 
        variant="outlined" 
        startIcon={<DownloadIcon />} 
        onClick={handleClick}
        disabled={data.length === 0}
        {...buttonProps}
      >
        {buttonText}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Tooltip title="Export as PDF document" placement="left">
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon>
              <PdfIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="PDF Document" />
          </MenuItem>
        </Tooltip>
        
        <Tooltip title="Export as CSV spreadsheet" placement="left">
          <MenuItem onClick={() => handleExport('csv')}>
            <ListItemIcon>
              <CsvIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="CSV Spreadsheet" />
          </MenuItem>
        </Tooltip>
      </Menu>
    </>
  );
};

export default ExportMenu; 