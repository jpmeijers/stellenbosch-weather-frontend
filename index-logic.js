/* global moment */
/* global jQuery */
/* global timeago */

// const apiBaseUrl = 'http://localhost:8081/';
const apiBaseUrl = 'http://weather.sun.ac.za/api/';

const imageModal = document.getElementById('imageModal');
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
const cardCurrentBody = document.getElementById('cardCurrentBody');
const outdoorTemperature = document.getElementById('outdoorTemperature');
const outdoorTemperatureFooter = document.getElementById('outdoorTemperatureFooter');
const cardForecastBody = document.getElementById('cardForecastBody');
const moonImage = document.getElementById('moonImage');
const moonStats = document.getElementById('moonStats');
const sunStats = document.getElementById('sunStats');
const cardStarsBody = document.getElementById('cardStarsBody');

async function refresh() {
    console.log('Refreshing weather data...');
    clearAlertMessage();

    await refreshCurrentWeather();
    await refreshForecast();
    await refreshMoon();
    await refreshSun();
    await refreshStars();
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
            <div>${phaseName}</div>
            <div>Moonrise: ${moonriseTime}</div>
            <div>Moonset: ${moonsetTime}</div>
        `

    } catch (error) {
        moonStats.innerHTML = '<div class="text-muted">---</div>';
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
            <div>Sunrise: ${sunriseTime}</div>
            <div>Solar Noon: ${solarNoonTime}</div>
            <div>Sunset: ${sunsetTime}</div>
        `;

    } catch (error) {
        sunStats.innerHTML = '<div class="text-muted">---</div>';
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

        if (windSpeedNum < 1) windString = "calm";
        else if (windSpeedNum > 8.3) windString = windString + ", stormy";
        else if (windSpeedNum > 5.6) windString = windString + ", very windy";
        else if (windSpeedNum > 2.8) windString = windString + ", windy";

        cardCurrentBody.innerHTML = [
            `<div>Date: ${momentObject.format("dddd, D MMMM YYYY, H:mm")}</div>`,
            `<div>Wind: ${windString}</div>`,
            `<div>Rain: <span class="text-muted">unavailable</span></div>`,
            `<div>Humidity: ${data["RH"]}%</div>`,
            `<div>Barometer: ${data["BP_mB_Avg"]}hPa</div>`,
        ].join('')



        $("time#currentUpdated").timeago("update", new Date());
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
            <div>Min: ${data["min_temp"]}&deg;C @ ${minTime}</div>
            <div>Max: ${data["max_temp"]}&deg;C @ ${maxTime}</div>`
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

    data.properties.timeseries.forEach(entry => {
        const time = moment(entry.time);
        const temp = entry.data.instant.details.air_temperature;
        const dateStr = time.format('YYYY-MM-DD');

        if (dateStr === todayStr) {
            todayTemps.push(temp);
        } else if (dateStr === tomorrowStr) {
            tomorrowTemps.push(temp);
        }
    });

    const todayMax = todayTemps.length > 0 ? Math.max(...todayTemps) : 'N/A';
    const todayMin = todayTemps.length > 0 ? Math.min(...todayTemps) : 'N/A';
    const tomorrowMax = tomorrowTemps.length > 0 ? Math.max(...tomorrowTemps) : 'N/A';
    const tomorrowMin = tomorrowTemps.length > 0 ? Math.min(...tomorrowTemps) : 'N/A';


    try {
        cardForecastBody.innerHTML = [
            `<div>Date: ${today.format("dddd, D MMMM YYYY")}</div>`,
            `<div>Max: ${todayMax}°C Min: ${todayMin}°C</div>`,
            `<br>`, // Add a line break for spacing
            `<div>Date: ${tomorrow.format("dddd, D MMMM YYYY")}</div>`,
            `<div>Max: ${tomorrowMax}°C Min: ${tomorrowMin}°C</div>`,
        ].join('')

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


// Top level functions, aka entry point
window.onload = refresh;
window.setInterval(refresh, 60000);

jQuery(document).ready(function () {
    $("time.timeago").timeago();
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