/* global moment */
/* global jQuery */
/* global timeago */

const apiBaseUrl = 'http://weather.sun.ac.za/api/';

const imageModal = document.getElementById('imageModal');
const chartModal = new bootstrap.Modal(document.getElementById('chartModal'));
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

const cardCurrentBody = document.getElementById('cardCurrentBody');
const outdoorTemperature = document.getElementById('outdoorTemperature');
const outdoorTemperatureFooter = document.getElementById('outdoorTemperatureFooter');
const cardForecastBody = document.getElementById('cardForecastBody');

const moonStats = document.getElementById('moonStats');
const moonImageContainer = document.getElementById('moonImageContainer');

const sunStats = document.getElementById('sunStats');
const earthImageContainer = document.getElementById('earthImageContainer');

const cardStarsBody = document.getElementById('cardStarsBody');

let tempChartInstance = null;

async function refreshOnLoad() {
    clearAlertMessage();
    refreshCurrentWeather().then();
    refreshForecast().then();
    refreshSun().then();
    refreshEarthImage().then();
    refreshMoon().then();
    refreshMoonImage().then();
    refreshStars();
}

async function refreshMinutely() {
    clearAlertMessage();
    await refreshCurrentWeather();
}

async function refreshHourly() {
    clearAlertMessage();
    await refreshForecast();
    await refreshMoon();
    await refreshSun();
    await refreshMoonImage();
    await refreshEarthImage();
    refreshStars();
}

async function refreshDaily() {
    // clearAlertMessage();
}

async function refreshCurrentWeather() {
    try {
        const response = await fetch(apiBaseUrl + 'current/')
        ;
        const data = await response.json();
        console.log(data);

        if (data.error) {
            console.log('Error from server:', data.error);
            setAlertMessage('Error fetching weather data', 'warning')
        } else {
            updateCurrent(data);
            updateTemperature(data);
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        setAlertMessage('Error fetching weather data', 'warning')
    }
}

async function refreshForecast() {
    try {
        const response = await fetch(apiBaseUrl + 'forecast/');
        const data = await response.json();
        console.log(data);

        if (data.error) {
            clearCurrent();
            clearTemperature();
            console.log('Error from server:', data.error);
            setAlertMessage('Error fetching forecast data', 'warning')
        } else {
            updateForecast(data);
        }

    } catch (error) {
        clearCurrent();
        clearTemperature();
        console.error('Error fetching data:', error);
        setAlertMessage('Error fetching forecast data', 'warning')
    }
}

async function refreshMoon() {
    try {
        const date = new Date();

        // Get illumination data (fraction/percentage, phase)
        const illuminationData = SunCalc.getMoonIllumination(date);
        const moonPhaseValue = illuminationData.phase; // 0.0 (new) to 0.5 (full) to 1.0 (waning crescent)

        let phaseName = '';
        if (moonPhaseValue < 0.03) {
            phaseName = 'New Moon';
        } else if (moonPhaseValue < 0.25) {
            phaseName = 'Waxing Crescent';
        } else if (moonPhaseValue < 0.28) {
            phaseName = 'First Quarter';
        } else if (moonPhaseValue < 0.5) {
            phaseName = 'Waxing Gibbous';
        } else if (moonPhaseValue < 0.53) {
            phaseName = 'Full Moon';
        } else if (moonPhaseValue < 0.75) {
            phaseName = 'Waning Gibbous';
        } else if (moonPhaseValue < 0.78) {
            phaseName = 'Last Quarter';
        } else {
            phaseName = 'Waning Crescent';
        }

        const moonTimes = SunCalc.getMoonTimes(date, -33.9, 18.9)
        const moonriseTime = moonTimes.rise ? moment(moonTimes.rise).format('HH:mm') : 'N/A';
        const moonsetTime = moonTimes.set ? moment(moonTimes.set).format('HH:mm') : 'N/A';

        moonStats.innerHTML = `
            <div><span class="fw-bold">${phaseName}</span></div>
            <div><span class="fw-bold">Moonrise:</span> ${moonriseTime}</div>
            <div><span class="fw-bold">Moonset:</span> ${moonsetTime}</div>
        `

    } catch (error) {
        moonStats.innerHTML = '<div class="text-muted">---</div>';
    }
}

async function refreshMoonImage() {
    try {
        const response = await fetch(apiBaseUrl + 'moon/');

        if (!response.ok) {
            console.log('Error from server:', response.status);
            setAlertMessage('Error fetching moon image data', 'warning');
            moonImageContainer.innerHTML = '';
        } else {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            moonImageContainer.innerHTML = `
                <a href="#"
                   data-bs-toggle="modal" data-bs-target="#imageModal"
                   data-img-url="${imageUrl}">
                    <div class="m-2">
                        <img src="${imageUrl}" alt="Moon" style="max-height: 150px;">
                    </div>
                </a>
            `;
        }

    } catch (error) {
        console.error('Error fetching moon image:', error);
        setAlertMessage('Error fetching moon image data', 'warning');
        moonImageContainer.innerHTML = '';
    }
}

async function refreshSun() {
    try {
        const date = new Date();
        const sunTimes = SunCalc.getTimes(date, -33.9, 18.9);
        const sunriseTime = sunTimes.sunrise ? moment(sunTimes.sunrise).format('HH:mm') : 'N/A';
        const sunsetTime = sunTimes.sunset ? moment(sunTimes.sunset).format('HH:mm') : 'N/A';
        const solarNoonTime = sunTimes.solarNoon ? moment(sunTimes.solarNoon).format('HH:mm') : 'N/A';

        sunStats.innerHTML = `
            <div><span class="fw-bold">Sunrise:</span> ${sunriseTime}</div>
            <div><span class="fw-bold">Solar Noon:</span> ${solarNoonTime}</div>
            <div><span class="fw-bold">Sunset:</span>${sunsetTime}</div>
        `;

    } catch (error) {
        sunStats.innerHTML = '<div class="text-muted">---</div>';
    }
}

async function refreshEarthImage() {
    try {
        const response = await fetch(apiBaseUrl + 'earth/');

        if (!response.ok) {
            console.log('Error from server:', response.status);
            setAlertMessage('Error fetching earth image data', 'warning');
            earthImageContainer.innerHTML = '';
        } else {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            earthImageContainer.innerHTML = `
                <a href="#"
                   data-bs-toggle="modal" data-bs-target="#imageModal"
                   data-img-url="${imageUrl}">
                    <div class="m-2">
                        <img src="${imageUrl}" alt="Earth" style="max-height: 150px;">
                    </div>
                </a>
            `;
        }

    } catch (error) {
        console.error('Error fetching earth image:', error);
        setAlertMessage('Error fetching earth image data', 'warning');
        earthImageContainer.innerHTML = '';
    }
}

function refreshStars() {
    /*
    https://www.classroomastronomer.com/zodiac.htm
    Aries: Apr 19 – May 13
    Taurus: May 14 – Jun 19
    Gemini: Jun 20 – Jul 20
    Cancer: Jul 21 – Aug 9
    Leo: Aug 10 – Sep 15
    Virgo: Sep 16 – Oct 30
    Libra: Oct 31 – Nov 22
    Scorpius: Nov 23 – Nov 29
    Ophiuchus: Nov 30 – Dec 17
    Sagittarius: Dec 18 – Jan 18
    Capricornus: Jan 19 – Feb 15
    Aquarius: Feb 16 – Mar 11
    Pisces: Mar 12 – Apr 18
     */
    try {
        const now = moment();
        const month = now.month() + 1; // moment months are 0-indexed
        const day = now.date();

        let zodiacSign = '';

        if ((month === 4 && day >= 19) || (month === 5 && day <= 13)) {
            zodiacSign = 'aries';
        } else if ((month === 5 && day >= 14) || (month === 6 && day <= 19)) {
            zodiacSign = 'taurus';
        } else if ((month === 6 && day >= 20) || (month === 7 && day <= 20)) {
            zodiacSign = 'gemini';
        } else if ((month === 7 && day >= 21) || (month === 8 && day <= 9)) {
            zodiacSign = 'cancer';
        } else if ((month === 8 && day >= 10) || (month === 9 && day <= 15)) {
            zodiacSign = 'leo';
        } else if ((month === 9 && day >= 16) || (month === 10 && day <= 30)) {
            zodiacSign = 'virgo';
        } else if ((month === 10 && day >= 31) || (month === 11 && day <= 22)) {
            zodiacSign = 'libra';
        } else if (month === 11 && day >= 23 && day <= 29) {
            zodiacSign = 'scorpius';
        } else if ((month === 11 && day >= 30) || (month === 12 && day <= 17)) {
            zodiacSign = 'ophiuchus';
        } else if ((month === 12 && day >= 18) || (month === 1 && day <= 18)) {
            zodiacSign = 'sagittarius';
        } else if ((month === 1 && day >= 19) || (month === 2 && day <= 15)) {
            zodiacSign = 'capricornus';
        } else if ((month === 2 && day >= 16) || (month === 3 && day <= 11)) {
            zodiacSign = 'aquarius';
        } else if ((month === 3 && day >= 12) || (month === 4 && day <= 18)) {
            zodiacSign = 'pisces';
        }

        let imageName = zodiacSign + '28vm-b.jpg';
        cardStarsBody.innerHTML = `
            <a href="#" class="img-fluid" 
               data-bs-toggle="modal" data-bs-target="#imageModal"
               data-img-url="/assets/zodiac/${imageName}">
                 <img src="/assets/zodiac/${imageName}" alt="${zodiacSign}"
                 style="max-height: 250px;">
            </a>
`;
    } catch (error) {
        cardStarsBody.innerHTML = '';
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

function clearCurrent() {
    cardCurrentBody.innerHTML = "<span class='text-muted'>---</span>";
    $("time#currentUpdated").timeago("update", null);
}

function updateCurrent(data) {
    try {
        const momentObject = moment(data["TimeStamp"], "YYYY-MM-DD HH:mm:ss");

        let windSpeedNum = Number(data["WS_ms_S_WVT"]);
        let windString = windSpeedNum + " m/s, " +
            windSectorFromAngle(data["WindDir_D1_WVT"]);

        if (windSpeedNum < 0.5) windString = "calm";
        else if (windSpeedNum >= 32.7) windString = windString + ", hurricane force";
        else if (windSpeedNum >= 28.5) windString = windString + ", violent storm";
        else if (windSpeedNum >= 24.5) windString = windString + ", storm";
        else if (windSpeedNum >= 20.8) windString = windString + ", strong gale";
        else if (windSpeedNum >= 17.2) windString = windString + ", gale";
        else if (windSpeedNum >= 13.9) windString = windString + ", near gale";
        else if (windSpeedNum >= 10.8) windString = windString + ", strong breeze";
        else if (windSpeedNum >= 8.0) windString = windString + ", fresh breeze";
        else if (windSpeedNum >= 5.5) windString = windString + ", moderate breeze";
        else if (windSpeedNum >= 3.4) windString = windString + ", gentle breeze";
        else if (windSpeedNum >= 1.6) windString = windString + ", light breeze";
        else if (windSpeedNum >= 0.5) windString = windString + ", light air";

        cardCurrentBody.innerHTML = [
            `<div class="fw-bold">${momentObject.format("dddd, D MMMM YYYY, H:mm")}</div>`,
            `<div><span class="fw-bold">Wind:</span> ${windString}</div>`,
            `<div><span class="fw-bold">Rain:</span> <span class="text-muted">unavailable</span></div>`,
            `<div><span class="fw-bold">Humidity:</span> ${data["RH"]}%</div>`,
            `<div><span class="fw-bold">Barometer:</span> ${data["BP_mB_Avg"]}hPa</div>`,
        ].join('')

        $("time#currentUpdated").timeago("update", new Date(data['TimeStamp']));
    } catch (error) {
        console.error('Error updating current:', error);
        setAlertMessage('Error updating current weather', 'danger')
    }
}

function clearTemperature() {
    outdoorTemperature.innerHTML = "<span class='text-muted'>---</span>";
}

function updateTemperature(data) {
    try {
        if (isNumeric(data["AirTC_Avg"])) {
            let temperature = Number(data["AirTC_Avg"]);
            temperature = Math.round(temperature * 10) / 10;
            outdoorTemperature.innerHTML = `${temperature}&deg;C`;
        } else {
            outdoorTemperature.innerHTML = "<span class='text-muted'>---</span>";
        }

        if(isNumeric(data["min_temp"]) && isNumeric(data["max_temp"])) {
            const minTime = moment(data["min_temp_time"], "HH:mm:ss").format("HH:mm");
            const maxTime = moment(data["max_temp_time"], "HH:mm:ss").format("HH:mm");

            outdoorTemperatureFooter.innerHTML = `
            <div>Max: ${data["max_temp"]}&deg;C @ ${maxTime}</div>
            <div>Min: ${data["min_temp"]}&deg;C @ ${minTime}</div>`
        } else {
            outdoorTemperatureFooter.innerHTML = "<span class='text-muted'>---</span>";
        }

    } catch (error) {
        outdoorTemperature.innerHTML = "<span class='text-muted'>---</span>";
        console.error('Error updating current:', error);
        setAlertMessage('Error updating temperature', 'danger')
    }
}


function updateForecast(data) {
    if (!data.properties || !data.properties.timeseries) {
        cardForecastBody.innerHTML = `<div class="text-muted">unavailable</div>`;
        console.error('Forecast data does not contain data');
        setAlertMessage('Error updating forecast', 'danger')
        return;
    }

    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'days').startOf('day');
    const todayStr = today.format('YYYY-MM-DD');
    const tomorrowStr = tomorrow.format('YYYY-MM-DD');

    let todayTemps = [];
    let tomorrowTemps = [];
    let todaySymbol = '';
    let tomorrowSymbol = '';

    data.properties.timeseries.forEach(entry => {
        const time = moment(entry.time);
        const temp = entry.data.instant.details.air_temperature;
        const dateStr = time.format('YYYY-MM-DD');
        const symbol = entry.data.next_1_hours?.summary?.symbol_code || entry.data.next_6_hours?.summary?.symbol_code;

        if (dateStr === todayStr) {
            todayTemps.push(temp);
            if (time.hour() === 12) todaySymbol = symbol;
        } else if (dateStr === tomorrowStr) {
            tomorrowTemps.push(temp);
            if (time.hour() === 12) tomorrowSymbol = symbol;
        }
    });

    // Fallback to first available symbol if noon isn't found
    if (!todaySymbol && todayTemps.length > 0) todaySymbol = data.properties.timeseries[0].data.next_1_hours?.summary?.symbol_code || data.properties.timeseries[0].data.next_6_hours?.summary?.symbol_code;
    if (!tomorrowSymbol && tomorrowTemps.length > 0) {
        const firstTom = data.properties.timeseries.find(e => moment(e.time).format('YYYY-MM-DD') === tomorrowStr);
        tomorrowSymbol = firstTom?.data.next_1_hours?.summary?.symbol_code || firstTom?.data.next_6_hours?.summary?.symbol_code;
    }

    const todayMax = todayTemps.length > 0 ? Math.max(...todayTemps) : 'N/A';
    const todayMin = todayTemps.length > 0 ? Math.min(...todayTemps) : 'N/A';
    const tomorrowMax = tomorrowTemps.length > 0 ? Math.max(...tomorrowTemps) : 'N/A';
    const tomorrowMin = tomorrowTemps.length > 0 ? Math.min(...tomorrowTemps) : 'N/A';


    try {
        cardForecastBody.innerHTML = `
        <div class="row">
            <div class="col">
                <div class="fw-bold">${today.format("dddd, D MMMM YYYY")}</div>
                <div>Max: ${todayMax}°C Min: ${todayMin}°C</div>
            </div>
            <div class="col">
                ${getWeatherIcon(todaySymbol, "50px")}
            </div>
        </div>
        <div class="row mt-1">
            <div class="col">
                <div class="fw-bold">${tomorrow.format("dddd, D MMMM YYYY")}</div>
                <div>Max: ${tomorrowMax}°C Min: ${tomorrowMin}°C</div>
            </div>
            <div class="col">
                ${getWeatherIcon(tomorrowSymbol, "50px")}
            </div>
        </div>
        <div class="row mt-1">
            <div class="col small">
                <a href="/forecasts/">See more</a>
            </div>
        </div>
        `;

        $("time#forecastUpdated").timeago("update", new Date(data.last_modified));
    } catch (error) {
        console.error('Error updating current:', error);
        setAlertMessage('Error updating current weather', 'danger')
    }
}

function windSectorFromAngle(angle) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return directions[Math.round(angle / 22.5)];
}

function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function createTemperatureChart(historyData) {
    const ctx = document.getElementById('tempChart');
    if (!ctx || typeof Chart === 'undefined') return;

    // Destroy previous instance if it exists to avoid scale errors
    if (tempChartInstance) {
        tempChartInstance.destroy();
    }

    // Map data and filter out nulls or invalid timestamps
    const chartData = historyData
        .filter(entry => entry.AirTC_Avg !== null && entry.TimeStamp)
        .map(entry => {
            const date = new Date(entry.TimeStamp);
            return isNaN(date.getTime()) ? null : { x: date, y: entry.AirTC_Avg };
        })
        .filter(entry => entry !== null);

    if (chartData.length === 0) return;

    // Calculate night regions for annotation
    const lat = -33.9326; // Stellenbosch
    const lng = 18.8644;
    const annotations = [];

    historyData.forEach((entry, index) => {
        if (index === historyData.length - 1 || !entry.TimeStamp || !historyData[index+1].TimeStamp) return;

        const date = new Date(entry.TimeStamp);
        const sunTimes = SunCalc.getTimes(date, lat, lng);
        const isNight = date < sunTimes.sunrise || date > sunTimes.sunset;

        if (isNight) {
            const isStartOfBlock = index === 0 || (function() {
                const prevDate = new Date(historyData[index-1].TimeStamp);
                const prevSun = SunCalc.getTimes(prevDate, lat, lng);
                return !(prevDate < prevSun.sunrise || prevDate > prevSun.sunset);
            })();

            annotations.push({
                type: 'box',
                xMin: date,
                xMax: new Date(historyData[index+1].TimeStamp),
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

    tempChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Temperature (°C)',
                data: chartData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 0
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
                        displayFormats: { hour: 'ddd DD/MM' },
                        tooltipFormat: 'ddd DD/MM HH:mm'
                    },
                    ticks: {
                        source: 'auto',
                        callback: function(value) {
                            const date = new Date(value);
                            if (date.getHours() === 12) {
                                return moment(date).format('ddd DD/MM');
                            }
                            return null;
                        },
                        autoSkip: false,
                        maxRotation: 0
                    },
                    grid: {
                        color: (context) => {
                            if (context.tick && context.tick.value) {
                                const date = new Date(context.tick.value);
                                if (date.getHours() === 0) return 'rgba(0,0,0,0.15)';
                            }
                            return 'transparent';
                        }
                    }
                }
            }
        }
    });
}

async function showTemperatureHistory() {
    try {
        const response = await fetch(apiBaseUrl + 'history/');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            chartModal.show();
            // We wait a bit for the modal to be visible so the chart can calculate its size
            setTimeout(() => {
                createTemperatureChart(data);
            }, 200);
        }
    } catch (error) {
        console.error('Error fetching history:', error);
        setAlertMessage('Error fetching temperature history', 'danger');
    }
}

function getWeatherIcon(symbolCode, size = '40px') {
    if (!symbolCode) return '';
    return `<img 
                src="/assets/weathericons/weather/svg/${symbolCode}.svg"
                alt="${symbolCode}" 
                title="${symbolCode}"
                style="width: ${size}; height: ${size}; vertical-align: middle;"
            >`;
}

// Top level functions, aka entry point
window.onload = refreshOnLoad;
window.setInterval(refreshMinutely, 60000);
window.setInterval(refreshHourly, 3600000);
window.setInterval(refreshDaily, 86400000);

jQuery(document).ready(function () {
    $("time.timeago").timeago();

    if (outdoorTemperature) {
        outdoorTemperature.addEventListener('click', showTemperatureHistory);
    }

    // Fix ARIA accessibility warning by removing focus from modal elements when closing
    const chartModalElement = document.getElementById('chartModal');
    if (chartModalElement) {
        chartModalElement.addEventListener('hide.bs.modal', function () {
            if (document.activeElement && chartModalElement.contains(document.activeElement)) {
                document.activeElement.blur();
            }
        });
    }
});

// Listen for modal open events and update content
imageModal.addEventListener('show.bs.modal', function (event) {
    // Button that triggered the modal
    const triggerLink = event.relatedTarget;
    // Extract info from data-img-url attribute
    const imageUrl = triggerLink.getAttribute('data-img-url');

    // Get the image element inside the modal
    const modalImage = imageModal.querySelector('#modalImage');

    // Update the modal image source
    modalImage.src = imageUrl;
});