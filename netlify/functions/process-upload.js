const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the multipart form data
        const { file, userId } = JSON.parse(event.body);

        if (!file || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'File and user ID are required' })
            };
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(file.data, 'base64');

        // Parse the Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Transform data for database insertion
        const salesData = data.map(row => ({
            user_id: userId,
            date: new Date(row.Date || row.date),
            region: row.Region || row.region,
            product_category: row.Category || row.category,
            product_name: row.Product || row.product,
            sales_rep: row.Rep || row.rep,
            customer_segment: row.Segment || row.segment,
            units_sold: row.Units || row.units,
            revenue: row.Revenue || row.revenue,
            profit: row.Profit || row.profit,
            created_at: new Date(),
            updated_at: new Date()
        }));

        // Insert data into Supabase
        const { error } = await supabase
            .from('sales_data')
            .insert(salesData);

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File processed successfully',
                records: salesData.length
            })
        };
    } catch (error) {
        console.error('Error processing file:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};