// Global variables
let charts = {};
let autoSyncInterval;
let sampleData = {
    salesTrend: {
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            actual: [185, 210, 195, 230, 250, 248, 260],
            target: [190, 200, 210, 220, 240, 250, 255]
        },
        quarterly: {
            labels: ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023'],
            actual: [580, 620, 710, 780, 820],
            target: [600, 650, 700, 750, 800]
        }
    },
    regions: {
        labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        data: [45, 30, 20, 5]
    },
    targets: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        target: [650, 720, 780, 800],
        actual: [680, 710, 750, 248]
    },
    pipeline: {
        labels: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'],
        data: [120, 180, 220, 150, 248]
    }
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function () {
    initCharts();
    setupEventListeners();
    updateLastSyncTime();
    startAutoSync();
    setupNavigation();
});

// Set up navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Get the section to show
            const sectionId = this.getAttribute('data-section');

            // Hide all sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });

            // Show the selected section
            document.getElementById(sectionId).classList.add('active');

            // If it's not the dashboard, update the page title
            if (sectionId !== 'dashboard') {
                const sectionName = this.textContent.trim();
                document.title = sectionName + ' - Sales Manager Dashboard';
            } else {
                document.title = 'Sales Manager Dashboard';
            }

            // Show a toast notification
            showToast(`Now viewing ${this.textContent.trim()}`);
        });
    });
}

// Initialize all charts
function initCharts() {
    // Sales Trend Chart
    const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
    charts.salesTrend = new Chart(salesTrendCtx, {
        type: 'line',
        data: {
            labels: sampleData.salesTrend.monthly.labels,
            datasets: [{
                label: 'Actual Sales',
                data: sampleData.salesTrend.monthly.actual,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.3
            }, {
                label: 'Target',
                data: sampleData.salesTrend.monthly.target,
                borderColor: '#e74c3c',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Sales ($ thousands)'
                    }
                }
            }
        }
    });

    // Region Chart
    const regionCtx = document.getElementById('regionChart').getContext('2d');
    charts.region = new Chart(regionCtx, {
        type: 'doughnut',
        data: {
            labels: sampleData.regions.labels,
            datasets: [{
                data: sampleData.regions.data,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Target Chart
    const targetCtx = document.getElementById('targetChart').getContext('2d');
    charts.target = new Chart(targetCtx, {
        type: 'bar',
        data: {
            labels: sampleData.targets.labels,
            datasets: [{
                label: 'Target',
                data: sampleData.targets.target,
                backgroundColor: 'rgba(52, 152, 219, 0.5)'
            }, {
                label: 'Actual',
                data: sampleData.targets.actual,
                backgroundColor: 'rgba(46, 204, 113, 0.5)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Sales ($ thousands)'
                    }
                }
            }
        }
    });

    // Pipeline Chart
    const pipelineCtx = document.getElementById('pipelineChart').getContext('2d');
    charts.pipeline = new Chart(pipelineCtx, {
        type: 'bar',
        data: {
            labels: sampleData.pipeline.labels,
            datasets: [{
                label: 'Pipeline Value',
                data: sampleData.pipeline.data,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Additional charts for other sections
    initAdditionalCharts();
}

// Initialize charts for other sections
function initAdditionalCharts() {
    // Annual Target Chart
    const annualTargetCtx = document.getElementById('annualTargetChart').getContext('2d');
    charts.annualTarget = new Chart(annualTargetCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Target',
                data: [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120],
                backgroundColor: 'rgba(52, 152, 219, 0.5)'
            }, {
                label: 'Actual Sales',
                data: [68, 72, 79, 83, 88, 92, 97, 102, 98, 105, 0, 0],
                backgroundColor: 'rgba(46, 204, 113, 0.5)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales ($ thousands)'
                    }
                }
            }
        }
    });

    // Forecast Chart
    const forecastCtx = document.getElementById('forecastChart').getContext('2d');
    charts.forecast = new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Target',
                data: [650, 720, 780, 800],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true
            }, {
                label: 'Forecast',
                data: [680, 710, 750, 760],
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                fill: true
            }, {
                label: 'Actual',
                data: [680, 710, 750, 248],
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Sales ($ thousands)'
                    }
                }
            }
        }
    });

    // Top Products Chart
    const topProductsCtx = document.getElementById('topProductsChart').getContext('2d');
    charts.topProducts = new Chart(topProductsCtx, {
        type: 'bar',
        data: {
            labels: ['Premium Widget', 'Standard Widget', 'Deluxe Package', 'Basic Package', 'Enterprise Solution'],
            datasets: [{
                label: 'Revenue',
                data: [247, 284, 192, 205, 147],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue ($ thousands)'
                    }
                }
            }
        }
    });

    // Sales Channel Chart
    const salesChannelCtx = document.getElementById('salesChannelChart').getContext('2d');
    charts.salesChannel = new Chart(salesChannelCtx, {
        type: 'doughnut',
        data: {
            labels: ['Direct Sales', 'Online', 'Retail Partners', 'Resellers'],
            datasets: [{
                data: [45, 30, 15, 10],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Team Activity Chart
    const teamActivityCtx = document.getElementById('teamActivityChart').getContext('2d');
    charts.teamActivity = new Chart(teamActivityCtx, {
        type: 'bar',
        data: {
            labels: ['John Doe', 'Jane Smith', 'Robert Johnson'],
            datasets: [{
                label: 'Calls',
                data: [78, 64, 52],
                backgroundColor: '#3498db'
            }, {
                label: 'Meetings',
                data: [24, 19, 16],
                backgroundColor: '#2ecc71'
            }, {
                label: 'Demos',
                data: [18, 15, 12],
                backgroundColor: '#f39c12'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Activity Count'
                    }
                }
            }
        }
    });

    // Regional Map Chart
    const regionalMapCtx = document.getElementById('regionalMapChart').getContext('2d');
    charts.regionalMap = new Chart(regionalMapCtx, {
        type: 'bar',
        data: {
            labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
            datasets: [{
                label: 'QTD Sales',
                data: [356, 284, 198, 95],
                backgroundColor: '#3498db'
            }, {
                label: 'QTD Target',
                data: [340, 300, 220, 120],
                backgroundColor: '#e74c3c',
                type: 'line',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales ($ thousands)'
                    }
                }
            }
        }
    });

    // Regional Performance Chart
    const regionalPerformanceCtx = document.getElementById('regionalPerformanceChart').getContext('2d');
    charts.regionalPerformance = new Chart(regionalPerformanceCtx, {
        type: 'doughnut',
        data: {
            labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
            datasets: [{
                data: [45, 30, 20, 5],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Top Selling Chart
    const topSellingCtx = document.getElementById('topSellingChart').getContext('2d');
    charts.topSelling = new Chart(topSellingCtx, {
        type: 'bar',
        data: {
            labels: ['Premium Widget', 'Standard Widget', 'Deluxe Package', 'Basic Package', 'Enterprise Solution'],
            datasets: [{
                label: 'Units Sold',
                data: [1240, 2845, 385, 1025, 42],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Units Sold'
                    }
                }
            }
        }
    });

    // Product Category Chart
    const productCategoryCtx = document.getElementById('productCategoryChart').getContext('2d');
    charts.productCategory = new Chart(productCategoryCtx, {
        type: 'pie',
        data: {
            labels: ['Electronics', 'Software', 'Services', 'Accessories'],
            datasets: [{
                data: [45, 30, 20, 5],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Toggle schedule settings visibility
    document.getElementById('scheduledUpload').addEventListener('change', function () {
        document.getElementById('scheduleSettings').style.display = this.checked ? 'block' : 'none';
    });

    // Upload and process button
    document.getElementById('uploadProcessBtn').addEventListener('click', handleFileUpload);

    // Monthly/Quarterly view toggle
    document.getElementById('monthlyView').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('quarterlyView').classList.remove('active');
        updateSalesTrendChart('monthly');
    });

    document.getElementById('quarterlyView').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('monthlyView').classList.remove('active');
        updateSalesTrendChart('quarterly');
    });

    // Auto sync toggle
    document.getElementById('autoUpdateSwitch').addEventListener('change', function () {
        if (this.checked) {
            startAutoSync();
            showToast('Auto sync enabled');
        } else {
            stopAutoSync();
            showToast('Auto sync disabled');
        }
    });

    // Filter changes
    const filters = ['dateRange', 'regionFilter', 'salesRepFilter', 'productCategoryFilter', 'customerSegmentFilter'];
    filters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', function () {
            applyFilters();
        });
    });

    // View details button
    document.getElementById('viewDetailsBtn').addEventListener('click', function () {
        showToast('Detailed team performance report generated');
    });
}

// Handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a file to upload', 'error');
        return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'csv') {
        showToast('Please upload a valid Excel or CSV file', 'error');
        return;
    }

    // Show loading state
    const uploadBtn = document.getElementById('uploadProcessBtn');
    const originalText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    uploadBtn.disabled = true;

    // Simulate file processing
    setTimeout(() => {
        // Process the file with SheetJS
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Simulate data extraction and update
                simulateDataUpdate(workbook);

                // Update UI
                updateLastSyncTime();
                showToast('File uploaded and data processed successfully');

                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
            } catch (error) {
                console.error('Error processing file:', error);
                showToast('Error processing file: ' + error.message, 'error');
            } finally {
                // Reset button state
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
            }
        };
        reader.readAsArrayBuffer(file);
    }, 2000);
}

// Simulate data update from Excel file
function simulateDataUpdate(workbook) {
    // In a real application, you would parse the Excel data and update the charts
    // For this demo, we'll just slightly modify the sample data to simulate an update

    // Modify sales data
    sampleData.salesTrend.monthly.actual = sampleData.salesTrend.monthly.actual.map(
        value => value * (0.95 + Math.random() * 0.1)
    );

    // Modify regional data
    sampleData.regions.data = sampleData.regions.data.map(
        value => value * (0.9 + Math.random() * 0.2)
    );

    // Normalize to 100%
    const regionSum = sampleData.regions.data.reduce((a, b) => a + b, 0);
    sampleData.regions.data = sampleData.regions.data.map(value => (value / regionSum) * 100);

    // Update all charts
    updateAllCharts();

    // Update team performance table with random changes
    const table = document.getElementById('teamPerformanceTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells.length >= 3) {
            // Update revenue
            const revenueText = cells[2].textContent;
            const revenue = parseFloat(revenueText.replace(/[^0-9.]/g, ''));
            const newRevenue = revenue * (0.9 + Math.random() * 0.2);
            cells[2].textContent = '$' + Math.round(newRevenue).toLocaleString();

            // Update quota attainment
            const progressBar = cells[3].querySelector('.progress-bar');
            const attainmentText = cells[3].querySelector('span');
            const newAttainment = Math.min(100, Math.round(parseFloat(attainmentText.textContent) * (0.95 + Math.random() * 0.1)));
            progressBar.style.width = newAttainment + '%';
            progressBar.className = 'progress-bar ' + (
                newAttainment >= 90 ? 'bg-success' :
                    newAttainment >= 75 ? 'bg-warning' : 'bg-danger'
            );
            attainmentText.textContent = newAttainment + '%';

            // Update trend indicator
            const trendIcon = cells[5].querySelector('i');
            const isImproving = Math.random() > 0.3;
            trendIcon.className = isImproving ? 'fas fa-arrow-up text-success' : 'fas fa-arrow-down text-danger';
        }
    }
}

// Update sales trend chart based on view type
function updateSalesTrendChart(viewType) {
    charts.salesTrend.data.labels = sampleData.salesTrend[viewType].labels;
    charts.salesTrend.data.datasets[0].data = sampleData.salesTrend[viewType].actual;
    charts.salesTrend.data.datasets[1].data = sampleData.salesTrend[viewType].target;
    charts.salesTrend.update();
}

// Update all charts with current data
function updateAllCharts() {
    // Update sales trend chart (monthly view)
    charts.salesTrend.data.datasets[0].data = sampleData.salesTrend.monthly.actual;
    charts.salesTrend.data.datasets[1].data = sampleData.salesTrend.monthly.target;
    charts.salesTrend.update();

    // Update region chart
    charts.region.data.datasets[0].data = sampleData.regions.data;
    charts.region.update();

    // Update target chart
    charts.target.data.datasets[0].data = sampleData.targets.target;
    charts.target.data.datasets[1].data = sampleData.targets.actual;
    charts.target.update();

    // Update pipeline chart
    charts.pipeline.data.datasets[0].data = sampleData.pipeline.data;
    charts.pipeline.update();
}

// Apply filters to dashboard
function applyFilters() {
    // In a real application, you would filter the data based on the selected filters
    // For this demo, we'll just show a toast notification
    const dateRange = document.getElementById('dateRange').value;
    const region = document.getElementById('regionFilter').value;
    const salesRep = document.getElementById('salesRepFilter').value;

    showToast(`Filters applied: ${dateRange}, ${region}, ${salesRep}`);
}

// Update last sync time
function updateLastSyncTime() {
    const now = new Date();
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('lastUpdateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Start auto sync
function startAutoSync() {
    // Check if auto sync is enabled
    if (document.getElementById('autoUpdateSwitch').checked) {
        // In a real application, this would sync with a backend
        // For this demo, we'll just update the last sync time periodically
        autoSyncInterval = setInterval(() => {
            updateLastSyncTime();
            showToast('Data auto-synced with server', 'info');
        }, 300000); // Every 5 minutes
    }
}

// Stop auto sync
function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    // Set message and style based on type
    toastMessage.textContent = message;

    if (type === 'error') {
        toastEl.querySelector('.toast-header').className = 'toast-header bg-danger text-white';
    } else if (type === 'info') {
        toastEl.querySelector('.toast-header').className = 'toast-header bg-info text-white';
    } else {
        toastEl.querySelector('.toast-header').className = 'toast-header bg-success text-white';
    }

    // Show the toast
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// --- Request for Stock --- //

document.body.addEventListener('click', function(event) {
    if (event.target.id === 'upload-stock-file-button') {
        handleStockFileUpload();
    }
});

async function handleStockFileUpload() {
    console.log('handleStockFileUpload called');
    const fileInput = document.getElementById('stock-file-input');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a file.', 'error');
        console.error('No file selected');
        return;
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        showToast('Invalid file type. Please select a .xlsx file.', 'error');
        console.error('Invalid file type:', file.type);
        return;
    }

    const uploadButton = document.getElementById('upload-stock-file-button');
    const originalButtonText = uploadButton.innerHTML;
    uploadButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
    uploadButton.disabled = true;

    const formData = new FormData();
    formData.append('stockfile', file);

    try {
        console.log('Sending request to serverless function...');
        const response = await fetch('/.netlify/functions/process-stock-request', {
            method: 'POST',
            body: formData
        });

        console.log('Response received from serverless function:', response);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.error || 'Failed to process file.');
        }

        const data = await response.json();
        console.log('Data received:', data);
        renderStockGrid(data);
        showToast('File processed successfully.', 'success');

    } catch (error) {
        console.error('Error during file upload:', error);
        showToast(error.message, 'error');
    } finally {
        uploadButton.innerHTML = originalButtonText;
        uploadButton.disabled = false;
    }
}

function renderStockGrid(data) {
    const container = document.getElementById('stock-grid-container');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data to display.</p>';
        return;
    }

    let table = '<table class="table table-bordered table-striped table-sm data-table">';

    // Headers
    const headers = Object.keys(data[0]);
    table += '<thead><tr>';
    headers.forEach(header => {
        table += `<th>${header}</th>`;
    });
    table += '</tr></thead>';

    // Body
    table += '<tbody>';
    data.forEach(row => {
        table += '<tr>';
        headers.forEach(header => {
            table += `<td>${row[header] || ''}</td>`;
        });
        table += '</tr>';
    });
    table += '</tbody>';

    table += '</table>';

    container.innerHTML = table;
}