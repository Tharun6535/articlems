import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { sanitize } from './dom-purify-fix';

// Safely stringify values by handling potential circular references
const safeStringify = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('Error stringifying object:', error);
      return '[Object]';
    }
  }
  
  return String(value);
};

/**
 * Export data to PDF format with a table layout
 * 
 * @param {Object} options - Export options
 * @param {Array} options.data - The data array to export
 * @param {Array} options.columns - Column definitions with title and dataKey
 * @param {string} options.filename - The filename for the downloaded file
 * @param {string} options.title - Title of the document
 * @param {Object} options.additionalInfo - Additional information to display (optional)
 */
export const exportToPdf = (options) => {
  const { data, columns, filename = 'export.pdf', title = 'Data Export', additionalInfo = {} } = options;
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set document properties
    doc.setProperties({
      title: sanitize(title),
      subject: 'Blog App Export',
      author: 'Blog App',
      keywords: 'pdf, export, data',
      creator: 'Blog App'
    });
    
    // Add title
    doc.setFontSize(16);
    doc.text(sanitize(title), 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    // Add additional info if provided
    let yPos = 27;
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      Object.entries(additionalInfo).forEach(([key, value]) => {
        doc.text(`${sanitize(key)}: ${sanitize(String(value))}`, 14, yPos);
        yPos += 5;
      });
      yPos += 3;
    } else {
      yPos = 30;
    }
    
    // Prepare table headers and data
    const headers = columns.map(col => sanitize(col.title));
    const tableData = data.map(item => 
      columns.map(col => {
        const value = item[col.dataKey];
        return sanitize(safeStringify(value));
      })
    );
    
    // Add table to the document using the autoTable plugin
    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: tableData,
      headStyles: {
        fillColor: [66, 133, 244],
        textColor: [255, 255, 255]
      },
      theme: 'grid',
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto',
        fontSize: 8
      }
    });
    
    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. See console for details.');
  }
};

/**
 * Export data to CSV format
 * 
 * @param {Object} options - Export options
 * @param {Array} options.data - The data array to export
 * @param {Array} options.columns - Column definitions with title and dataKey
 * @param {string} options.filename - The filename for the downloaded file
 */
export const exportToCsv = (options) => {
  const { data, columns, filename = 'export.csv' } = options;
  
  try {
    // Create header row
    const header = columns.map(col => `"${sanitize(col.title)}"`).join(',');
    
    // Create data rows
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.dataKey];
        // Handle different types of values
        return `"${sanitize(safeStringify(value)).replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    // Combine header and rows
    const csvContent = [header, ...rows].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating CSV:', error);
    alert('Failed to generate CSV. See console for details.');
  }
};

export default {
  exportToPdf,
  exportToCsv
}; 