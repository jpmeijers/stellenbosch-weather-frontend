const apiBaseUrl = 'http://weather.sun.ac.za/api/';
let historyChart = null;
let originalData = [];

async function fetchHistory() {
    try {
        const response = await fetch(apiBaseUrl + 'history/');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            originalData = data;
            setupHistoryControls(data);
            createHistoryChart();
        }
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

function setupHistoryControls(data) {
    const controls = document.getElementById('historyControls');
    if (!controls) return;

    // Get all keys from the first record, excluding non-numeric/time fields
    const keys = Object.keys(data[0]).filter(key => 
        !['Date', 'Time', 'TimeStamp', 'Record'].includes(key)
    );

    controls.innerHTML = ''; // Clear existing

    keys.forEach(key => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.id = `check_${key}`;
        checkbox.checked = (key === 'AirTC_Avg'); // Temperature default
        checkbox.onchange = () => updateChartDatasets();

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `check_${key}`;
        label.textContent = key.replace(/_/g, ' ');

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        controls.appendChild(wrapper);
    });
}

function createHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [] // Will be populated by updateChartDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: { hour: 'HH:mm' }
                    },
                    title: { display: true, text: 'Time' }
                },
                y: {
                    title: { display: true, text: 'Value' }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    updateChartDatasets();
}

function updateChartDatasets() {
    if (!historyChart) return;

    const datasets = [];
    const controls = document.querySelectorAll('#historyControls input[type="checkbox"]');
    
    // Define some colors for different fields
    const colors = [
        '#ff6384', '#36a2eb', '#4bc0c0', '#ff9f40', '#9966ff', 
        '#ffcd56', '#c9cbcf', '#77dd77', '#f4a460', '#e06666'
    ];

    controls.forEach((cb, index) => {
        if (cb.checked) {
            const key = cb.id.replace('check_', '');
            datasets.push({
                label: key.replace(/_/g, ' '),
                data: originalData.map(entry => ({
                    x: moment(entry.TimeStamp).toDate(),
                    y: entry[key]
                })),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '33', // 20% opacity
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.2
            });
        }
    });

    historyChart.data.datasets = datasets;
    historyChart.update();
}

window.onload = fetchHistory;