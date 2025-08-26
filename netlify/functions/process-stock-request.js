const xlsx = require('xlsx');
const busboy = require('busboy');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const fields = await parseMultipartForm(event);
    const file = fields.stockfile;

    if (!file) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No file uploaded.' }) };
    }

    const workbook = xlsx.read(file.content, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet, {
      range: 'A13:R912',
      header: 1, // Use the first row of the range as headers
      defval: '' // Default value for empty cells
    });

    // The first row of the data will be the headers
    const headers = data.length > 0 ? data[0] : [];
    const jsonData = data.slice(1).map(row => {
      let rowData = {};
      row.forEach((cell, index) => {
        if (headers[index]) {
          rowData[headers[index]] = cell;
        }
      });
      return rowData;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(jsonData)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'An error occurred while processing the file.' })
    };
  }
};

function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: event.headers });
    const fields = {};

    bb.on('file', (name, file, info) => {
      const { mimeType } = info;
      let content = [];
      file.on('data', (data) => {
        content.push(data);
      });
      file.on('end', () => {
        fields[name] = {
          filename: info.filename,
          mimeType: mimeType,
          content: Buffer.concat(content)
        };
      });
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('close', () => {
      resolve(fields);
    });

    bb.on('error', err => {
      reject(err);
    });

    bb.end(Buffer.from(event.body, 'base64'));
  });
}
