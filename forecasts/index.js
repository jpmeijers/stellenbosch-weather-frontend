const apiBaseUrl = 'http://weather.sun.ac.za/api/';

const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
const forecastsContainer = document.getElementById('forecastsContainer');

async function refresh() {
    try {
        const response = await fetch(apiBaseUrl + 'forecast/');
        const data = await response.json();
        console.log(data);

        clearAlertMessage();

        if (data.error) {
            console.log('Error from server:', data.error);
            setAlertMessage('Error fetching forecast data', 'warning')
        } else {
            updateForecast(data);
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        setAlertMessage('Error fetching forecast data', 'warning')
    }
}

function clearAlertMessage() {
    alertPlaceholder.innerHTML = '';
}

function setAlertMessage(message, type) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.innerHTML = '';
    alertPlaceholder.append(wrapper)
}

function updateForecast(data) {
    if (!data.properties || !data.properties.timeseries) {
        setAlertMessage('Invalid forecast data format', 'warning');
        return;
    }

    const timeseries = data.properties.timeseries; // Show everything available

    // Clear container
    forecastsContainer.innerHTML = '';

    // Create main container
    const mainDiv = document.createElement('div');
    mainDiv.style.cssText = 'padding: 20px; max-width: 1200px; margin: 0 auto;';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Weather Forecast';
    title.style.cssText = 'color: #333; margin-bottom: 20px;';
    mainDiv.appendChild(title);

    // Create temperature chart section
    const chartSection = document.createElement('div');
    chartSection.style.cssText = 'background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;';

    const chartTitle = document.createElement('h3');
    chartTitle.textContent = 'Temperature Trend';
    chartTitle.style.cssText = 'color: #555; margin-bottom: 15px;';
    chartSection.appendChild(chartTitle);

    const canvas = document.createElement('canvas');
    canvas.id = 'tempChart';
    canvas.style.cssText = 'max-height: 300px;';
    chartSection.appendChild(canvas);
    mainDiv.appendChild(chartSection);

    // Create hourly forecast cards
    const cardsSection = document.createElement('div');
    cardsSection.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;';

    // Show first 24 hours in cards for quick reading
    timeseries.slice(0, 24).forEach(entry => {
        const card = document.createElement('div');
        card.style.cssText = 'background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;';

        const time = document.createElement('div');
        time.textContent = formatTime(entry.time);
        time.style.cssText = 'font-weight: bold; color: #555; margin-bottom: 10px;';
        card.appendChild(time);

        const icon = document.createElement('div');
        icon.textContent = getWeatherIcon(entry.data.next_1_hours?.summary?.symbol_code || entry.data.next_6_hours?.summary?.symbol_code);
        icon.style.cssText = 'font-size: 40px; margin-bottom: 10px;';
        card.appendChild(icon);

        const temp = document.createElement('div');
        temp.textContent = `${entry.data.instant.details.air_temperature}°C`;
        temp.style.cssText = 'font-size: 24px; font-weight: bold; color: #333;';
        card.appendChild(temp);

        const precip = document.createElement('div');
        const precipAmount = entry.data.next_1_hours?.details?.precipitation_amount || 0;
        precip.textContent = `💧 ${precipAmount} mm`;
        precip.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px;';
        card.appendChild(precip);

        const wind = document.createElement('div');
        wind.textContent = `💨 ${entry.data.instant.details.wind_speed} m/s`;
        wind.style.cssText = 'font-size: 12px; color: #666;';
        card.appendChild(wind);

        cardsSection.appendChild(card);
    });
    mainDiv.appendChild(cardsSection);

    // Create detailed table
    const tableSection = document.createElement('div');
    tableSection.style.cssText = 'background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow-x: auto;';

    const tableTitle = document.createElement('h3');
    tableTitle.textContent = 'Detailed Forecast';
    tableTitle.style.cssText = 'color: #555; margin-bottom: 15px;';
    tableSection.appendChild(tableTitle);

    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Time</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Temp (°C)</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Precipitation (mm)</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Wind (m/s)</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Humidity (%)</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Pressure (hPa)</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    timeseries.forEach((entry, index) => { // Show full table
        const row = document.createElement('tr');
        row.style.cssText = index % 2 === 0 ? 'background: #fafafa;' : '';

        const details = entry.data.instant.details;
        const precipAmount = entry.data.next_1_hours?.details?.precipitation_amount || 0;

        row.innerHTML = `
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatTime(entry.time)}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${details.air_temperature}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${precipAmount}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${details.wind_speed}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${details.relative_humidity}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${details.air_pressure_at_sea_level}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    tableSection.appendChild(table);
    mainDiv.appendChild(tableSection);

    forecastsContainer.appendChild(mainDiv);

    // Render chart after DOM update
    setTimeout(() => createTemperatureChart(timeseries), 100);
}

function createTemperatureChart(timeseries) {
    const ctx = document.getElementById('tempChart');
    if (!ctx || typeof Chart === 'undefined') return;

    // Map data to objects containing x (Date) and y (Temperature)
    const chartData = timeseries.map(entry => ({
        x: new Date(entry.time),
        y: entry.data.instant.details.air_temperature
    }));

    // Calculate night regions for annotation
    const lat = -33.9326; // Stellenbosch
    const lng = 18.8644;
    const annotations = [];

    timeseries.forEach((entry, index) => {
        if (index === timeseries.length - 1) return;

        const date = new Date(entry.time);
        const sunTimes = SunCalc.getTimes(date, lat, lng);
        const isNight = date < sunTimes.sunrise || date > sunTimes.sunset;
    
        if (isNight) {
            const isStartOfBlock = index === 0 || (function() {
                const prevDate = new Date(timeseries[index-1].time);
                const prevSun = SunCalc.getTimes(prevDate, lat, lng);
                return !(prevDate < prevSun.sunrise || prevDate > prevSun.sunset);
            })();

            annotations.push({
                type: 'box',
                // With a time axis, we use the actual Date objects for xMin/xMax
                xMin: date,
                xMax: new Date(timeseries[index+1].time),
                backgroundColor: 'rgba(0, 0, 50, 0.07)',
                borderWidth: 0,
                drawTime: 'beforeDatasetsDraw',
                label: {
                    display: isStartOfBlock,
                    content: '',
                    color: 'rgba(0, 0, 0, 0.3)',
                    font: { size: 10 },
                    position: 'start'
                }
            });
        }
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Temperature (°C)',
                data: chartData, // Use the new x/y format
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 0 // Remove points for a cleaner long-term look
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' },
                annotation: { annotations: annotations }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Temperature (°C)' }
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        stepSize: 1, // Check every hour to find our label points
                        displayFormats: {
                            hour: 'ddd DD/MM'
                        },
                        tooltipFormat: 'ddd DD/MM HH:mm'
                    },
                    ticks: {
                        source: 'auto',
                        callback: function(value, index, ticks) {
                            const date = new Date(value);
                            // Keep labels centered at Noon
                            if (date.getHours() === 12) {
                                return moment(date).format('ddd DD/MM');
                            }
                            return null;
                        },
                        autoSkip: false,
                        maxRotation: 0
                    },
                    title: {
                        display: false,
                        text: 'Forecast Period'
                    },
                    grid: {
                        // Move gridlines to Midnight
                        color: (context) => {
                            if (context.tick && context.tick.value) {
                                const date = new Date(context.tick.value);
                                // Draw a solid line only at the start of the day (midnight)
                                if (date.getHours() === 0) {
                                    return 'rgba(0,0,0,0.15)';
                                }
                            }
                            return 'transparent';
                        },
                        drawOnChartArea: true,
                        drawTicks: true
                    }
                }
            }
        }
    });
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month} ${hours}:${minutes}`;
}

function getWeatherIcon(symbolCode) {
    if (!symbolCode) return '❓';

    const iconMap = {
        'clearsky': '☀️',
        'fair': '🌤️',
        'partlycloudy': '⛅',
        'cloudy': '☁️',
        'rain': '🌧️',
        'lightrain': '🌦️',
        'heavyrain': '⛈️',
        'snow': '❄️',
        'sleet': '🌨️',
        'fog': '🌫️',
        'thunder': '⚡'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
        if (symbolCode.includes(key)) return icon;
    }

    return '🌡️';
}


// Top level functions, aka entry point
window.onload = refresh;
// window.setInterval(refresh, 60000);