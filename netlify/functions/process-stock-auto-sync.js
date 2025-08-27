const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  console.log('Auto-sync function invoked');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid HTTP method:', event.httpMethod);
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { filePath, testOnly = false } = requestBody;

    if (!filePath) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File path is required' })
      };
    }

    console.log('Processing file path:', filePath);
    console.log('Test only mode:', testOnly);

    // Validate file path
    if (!filePath.toLowerCase().endsWith('.xlsx')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File must be an Excel (.xlsx) file' })
      };
    }

    // Check if file exists and is accessible
    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (accessError) {
      console.error('File access error:', accessError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Cannot access file: ${filePath}. Please check the path and permissions.`,
          details: accessError.message
        })
      };
    }

    // If this is just a test, return success
    if (testOnly) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'File is accessible',
          filePath: filePath,
          test: true
        })
      };
    }

    // Read and process the Excel file
    console.log('Reading Excel file...');
    const fileBuffer = await fs.promises.readFile(filePath);
    
    console.log('Parsing workbook...');
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    console.log('Workbook sheets:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log('Converting sheet to JSON...');
    // Extract data starting from row 13 (line 13) as specified
    const data = xlsx.utils.sheet_to_json(worksheet, {
      range: 12, // Start from row 13 (0-based index 12)
      header: 1, // Use first row in range as headers
      defval: '', // Keep empty cells as empty strings
      raw: false // Keep original formatting
    });

    console.log('Extracted data rows:', data.length);
    
    if (data.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No data found starting from row 13 in the Excel file.' })
      };
    }

    // The first row contains headers from line 13
    const headers_row = data[0];
    const dataRows = data.slice(1);
    
    console.log('Headers from row 13:', headers_row);
    console.log('Data rows:', dataRows.length);

    // Convert to object format, preserving all data including columns A and B
    const jsonData = dataRows.map((row, rowIndex) => {
      let rowData = {};
      row.forEach((cell, colIndex) => {
        const headerKey = headers_row[colIndex] || `Column_${colIndex + 1}`;
        // Preserve all data exactly as it appears, including empty cells
        rowData[headerKey] = cell !== undefined && cell !== null ? cell : '';
      });
      return rowData;
    });

    console.log('Successfully processed auto-sync file, returning', jsonData.length, 'rows');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(jsonData)
    };

  } catch (error) {
    console.error('Error in auto-sync function execution:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'An error occurred while processing the auto-sync.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};