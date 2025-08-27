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

// Auto-sync variables
let stockAutoSyncInterval = null;
let stockAutoSyncActive = false;

// Add event listener for stock file upload button
document.addEventListener('DOMContentLoaded', function() {
    const uploadStockButton = document.getElementById('upload-stock-file-button');
    const clearDataButton = document.getElementById('clear-stock-data');
    const fileInput = document.getElementById('stock-file-input');
    const autoSyncToggle = document.getElementById('stock-auto-sync-toggle');
    const startAutoSyncButton = document.getElementById('start-stock-auto-sync');
    const stopAutoSyncButton = document.getElementById('stop-stock-auto-sync');
    const testSyncButton = document.getElementById('test-stock-sync');
    
    if (uploadStockButton) {
        uploadStockButton.addEventListener('click', handleStockFileUpload);
    }
    
    if (clearDataButton) {
        clearDataButton.addEventListener('click', clearStockData);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const statusDiv = document.getElementById('upload-status');
            if (statusDiv) {
                statusDiv.innerHTML = '';
            }
        });
    }
    
    // Auto-sync event listeners
    if (autoSyncToggle) {
        autoSyncToggle.addEventListener('change', toggleAutoSyncSettings);
    }
    
    if (startAutoSyncButton) {
        startAutoSyncButton.addEventListener('click', startStockAutoSync);
    }
    
    if (stopAutoSyncButton) {
        stopAutoSyncButton.addEventListener('click', stopStockAutoSync);
    }
    
    if (testSyncButton) {
        testSyncButton.addEventListener('click', testStockSyncConnection);
    }
});

function clearStockData() {
    const container = document.getElementById('stock-grid-container');
    const clearButton = document.getElementById('clear-stock-data');
    const fileInput = document.getElementById('stock-file-input');
    const statusDiv = document.getElementById('upload-status');
    const summaryDiv = document.getElementById('data-summary');
    
    if (container) {
        container.innerHTML = '';
    }
    if (clearButton) {
        clearButton.style.display = 'none';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    if (statusDiv) {
        statusDiv.innerHTML = '';
    }
    if (summaryDiv) {
        summaryDiv.innerHTML = '';
    }
    
    showToast('Stock data cleared successfully.', 'info');
}

// Auto-sync functions
function toggleAutoSyncSettings() {
    const toggle = document.getElementById('stock-auto-sync-toggle');
    const settings = document.getElementById('stock-auto-sync-settings');
    
    if (toggle && settings) {
        settings.style.display = toggle.checked ? 'block' : 'none';
        
        if (!toggle.checked && stockAutoSyncActive) {
            stopStockAutoSync();
        }
    }
}

function updateAutoSyncStatus(message, type = 'info') {
    const statusDiv = document.getElementById('stock-auto-sync-status');
    if (!statusDiv) return;
    
    const iconClass = {
        'success': 'fas fa-check-circle text-success',
        'error': 'fas fa-exclamation-circle text-danger',
        'warning': 'fas fa-exclamation-triangle text-warning',
        'info': 'fas fa-info-circle text-info',
        'sync': 'fas fa-sync fa-spin text-primary'
    }[type] || 'fas fa-info-circle text-info';
    
    statusDiv.innerHTML = `<small><i class="${iconClass} me-1"></i>${message}</small>`;
}

function startStockAutoSync() {
    const filePath = document.getElementById('stock-file-path').value;
    const interval = parseInt(document.getElementById('stock-sync-interval').value);
    const startButton = document.getElementById('start-stock-auto-sync');
    const stopButton = document.getElementById('stop-stock-auto-sync');
    
    if (!filePath.trim()) {
        updateAutoSyncStatus('Please enter a valid file path', 'error');
        showToast('Please enter a valid file path for auto-sync', 'error');
        return;
    }
    
    // Validate file path format
    if (!filePath.toLowerCase().endsWith('.xlsx')) {
        updateAutoSyncStatus('File path must point to an .xlsx file', 'error');
        showToast('File path must point to an .xlsx file', 'error');
        return;
    }
    
    stockAutoSyncActive = true;
    startButton.style.display = 'none';
    stopButton.style.display = 'inline-block';
    
    updateAutoSyncStatus(`Auto-sync started (every ${interval} min)`, 'success');
    showToast(`Auto-sync started for: ${filePath}`, 'success');
    
    // Perform initial sync
    performStockAutoSync(filePath);
    
    // Set up interval
    stockAutoSyncInterval = setInterval(() => {
        performStockAutoSync(filePath);
    }, interval * 60000); // Convert minutes to milliseconds
}

function stopStockAutoSync() {
    const startButton = document.getElementById('start-stock-auto-sync');
    const stopButton = document.getElementById('stop-stock-auto-sync');
    
    stockAutoSyncActive = false;
    
    if (stockAutoSyncInterval) {
        clearInterval(stockAutoSyncInterval);
        stockAutoSyncInterval = null;
    }
    
    startButton.style.display = 'inline-block';
    stopButton.style.display = 'none';
    
    updateAutoSyncStatus('Auto-sync stopped', 'warning');
    showToast('Auto-sync stopped', 'info');
}

async function performStockAutoSync(filePath) {
    if (!stockAutoSyncActive) return;
    
    updateAutoSyncStatus('Syncing data...', 'sync');
    
    try {
        // Create a simulated file object for the serverless function
        // Note: In a real-world scenario, you'd need a backend service to read files from the system
        const response = await fetch('/.netlify/functions/process-stock-auto-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: filePath })
        });

        if (!response.ok) {
            throw new Error('Failed to sync data from file path');
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            renderStockGrid(data);
            updateAutoSyncStatus(`Last sync: ${new Date().toLocaleTimeString()}`, 'success');
            
            // Show clear button
            const clearButton = document.getElementById('clear-stock-data');
            if (clearButton) {
                clearButton.style.display = 'inline-block';
            }
        } else {
            updateAutoSyncStatus('No data found in sync', 'warning');
        }

    } catch (error) {
        console.error('Auto-sync error:', error);
        updateAutoSyncStatus(`Sync failed: ${error.message}`, 'error');
        
        // Don't stop auto-sync on error, just log it
        if (stockAutoSyncActive) {
            console.log('Auto-sync will retry on next interval');
        }
    }
}

async function testStockSyncConnection() {
    const filePath = document.getElementById('stock-file-path').value;
    const testButton = document.getElementById('test-stock-sync');
    
    if (!filePath.trim()) {
        updateAutoSyncStatus('Please enter a file path to test', 'error');
        showToast('Please enter a file path to test', 'error');
        return;
    }
    
    const originalText = testButton.innerHTML;
    testButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Testing...';
    testButton.disabled = true;
    
    updateAutoSyncStatus('Testing connection...', 'sync');
    
    try {
        // Test the file path accessibility
        const response = await fetch('/.netlify/functions/process-stock-auto-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: filePath, testOnly: true })
        });

        if (response.ok) {
            updateAutoSyncStatus('Connection test successful', 'success');
            showToast('File path is accessible and valid', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Connection test failed');
        }

    } catch (error) {
        console.error('Connection test error:', error);
        updateAutoSyncStatus(`Test failed: ${error.message}`, 'error');
        showToast(`Connection test failed: ${error.message}`, 'error');
    } finally {
        testButton.innerHTML = originalText;
        testButton.disabled = false;
    }
}

function updateUploadStatus(message, type = 'info') {
    const statusDiv = document.getElementById('upload-status');
    if (!statusDiv) return;
    
    const iconClass = {
        'loading': 'fas fa-spinner fa-spin',
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    statusDiv.innerHTML = `
        <div class="stock-upload-status ${type} mt-3">
            <i class="${iconClass} me-2"></i>${message}
        </div>
    `;
}

async function handleStockFileUpload() {
    console.log('handleStockFileUpload called');
    const fileInput = document.getElementById('stock-file-input');
    const file = fileInput.files[0];

    if (!file) {
        updateUploadStatus('Please select a file.', 'error');
        showToast('Please select a file.', 'error');
        console.error('No file selected');
        return;
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        updateUploadStatus('Invalid file type. Please select a .xlsx file.', 'error');
        showToast('Invalid file type. Please select a .xlsx file.', 'error');
        console.error('Invalid file type:', file.type);
        return;
    }

    const uploadButton = document.getElementById('upload-stock-file-button');
    const originalButtonText = uploadButton.innerHTML;
    uploadButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
    uploadButton.disabled = true;
    
    updateUploadStatus('Uploading and processing file...', 'loading');

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
        
        if (data && data.length > 0) {
            renderStockGrid(data);
            updateUploadStatus(`File processed successfully. ${data.length} rows loaded.`, 'success');
            showToast('File processed successfully.', 'success');
            
            // Show clear button
            const clearButton = document.getElementById('clear-stock-data');
            if (clearButton) {
                clearButton.style.display = 'inline-block';
            }
        } else {
            updateUploadStatus('No valid data found in the uploaded file.', 'error');
            showToast('No valid data found in the uploaded file.', 'error');
        }

    } catch (error) {
        console.error('Error during file upload:', error);
        updateUploadStatus(`Error: ${error.message}`, 'error');
        showToast(error.message, 'error');
    } finally {
        uploadButton.innerHTML = originalButtonText;
        uploadButton.disabled = false;
    }
}

function renderStockGrid(data) {
    const container = document.getElementById('stock-grid-container');
    const summaryDiv = document.getElementById('data-summary');
    
    if (!container) {
        console.error('Stock grid container not found');
        return;
    }

    // Clear previous content
    container.innerHTML = '';
    if (summaryDiv) {
        summaryDiv.innerHTML = '';
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="alert alert-info m-3"><i class="fas fa-info-circle me-2"></i>No data found starting from row 13. Please ensure your Excel file has data in the correct format.</div>';
        return;
    }

    // Get all headers from the first row (preserving exact Excel structure)
    const firstRow = data[0];
    const headers = Object.keys(firstRow);
    
    if (headers.length === 0) {
        container.innerHTML = '<div class="alert alert-danger m-3"><i class="fas fa-times-circle me-2"></i>No headers found in row 13 of the Excel file.</div>';
        return;
    }

    // Update summary - show exact Excel structure info
    if (summaryDiv) {
        summaryDiv.innerHTML = `${data.length} rows × ${headers.length} columns (Excel format preserved)`;
    }

    let table = '<div class="table-responsive">';
    table += '<table class="table table-bordered table-striped table-hover table-sm data-table mb-0">';

    // Headers from row 13 of Excel
    table += '<thead><tr>';
    headers.forEach((header, index) => {
        const columnLetter = String.fromCharCode(65 + index); // A, B, C, etc.
        const displayHeader = header.trim() === '' ? `Column ${columnLetter}` : header;
        table += `<th scope="col" title="Column ${columnLetter}: ${escapeHtml(header)}">${escapeHtml(displayHeader)}</th>`;
    });
    table += '</tr></thead>';

    // Body - show all data exactly as it appears in Excel
    table += '<tbody>';
    data.forEach((row, rowIndex) => {
        table += '<tr>';
        headers.forEach((header, colIndex) => {
            const cellValue = row[header];
            const displayValue = cellValue !== undefined && cellValue !== null ? cellValue : '';
            const columnLetter = String.fromCharCode(65 + colIndex);
            
            // Add special styling for columns A and B (fixed data columns)
            const isFixedColumn = colIndex === 0 || colIndex === 1;
            const cellClass = isFixedColumn ? 'table-warning' : '';
            const cellTitle = `${columnLetter}${rowIndex + 14}: ${String(displayValue)}`; // +14 because data starts from row 14 (after header row 13)
            
            table += `<td class="${cellClass}" title="${escapeHtml(cellTitle)}">${escapeHtml(String(displayValue))}</td>`;
        });
        table += '</tr>';
    });
    table += '</tbody>';
    table += '</table>';
    table += '</div>';

    // Add detailed summary info
    const summaryInfo = `
        <div class="px-3 py-2 bg-light border-top">
            <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                Displaying Excel data starting from <strong>Row 13</strong> (headers) with ${data.length} data rows and ${headers.length} columns
                <span class="ms-3">
                    <i class="fas fa-file-excel me-1"></i>
                    Columns A & B contain fixed data (highlighted in yellow)
                </span>
                <span class="ms-3">
                    <i class="fas fa-table me-1"></i>
                    Preserving exact Excel structure
                </span>
            </small>
        </div>
    `;
    
    container.innerHTML = table + summaryInfo;
    
    // Scroll to the table
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

