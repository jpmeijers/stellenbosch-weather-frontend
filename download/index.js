const apiBaseUrl = 'http://weather.sun.ac.za/api/';

const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

async function downloadFile(station) {
    alertPlaceholder.innerHTML = '';

    const spinner = document.getElementById('downloadFileSpinner');
    spinner.classList.remove('d-none');
    const spinnerText = document.getElementById('downloadFileText');
    spinnerText.classList.remove('d-none');

    const checkbox = document.getElementById('acceptTermsYes');
    const emailInput = document.getElementById('email');
    const url = `${apiBaseUrl}download/`;

    const body = {
        file: station,
        agree: checkbox.checked ? 'yes' : 'no',
        email: emailInput.value
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            alertPlaceholder.innerHTML = `<div class="alert alert-danger" role="alert">Error downloading file: ${errorText || response.status}</div>`;
            spinner.classList.add('d-none');
            spinnerText.classList.add('d-none');
            return;
        }

        const blob = await response.blob();

        // Only perform download if response is not empty
        if (blob.size === 0) {
            alertPlaceholder.innerHTML = `<div class="alert alert-warning" role="alert">No data returned for this station</div>`;
            spinner.classList.add('d-none');
            spinnerText.classList.add('d-none');
            return;
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `weather-data-${station}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
    } catch (error) {
        alertPlaceholder.innerHTML = `<div class="alert alert-danger" role="alert">Error downloading file: ${error.message}</div>`;
    }

    spinner.classList.add('d-none');
    spinnerText.classList.add('d-none');
}

async function downloadHistory() {
    alertPlaceholder.innerHTML = '';

    const spinner = document.getElementById('downloadHistorySpinner');
    spinner.classList.remove('d-none');
    const spinnerText = document.getElementById('downloadHistoryText');
    spinnerText.classList.remove('d-none');

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const startTimestamp = new Date(startDate + 'T00:00:00+02:00').getTime();
    const endTimestamp = new Date(endDate + 'T23:59:59+02:00').getTime();

    const checkbox = document.getElementById('acceptTermsYes');
    const emailInput = document.getElementById('email');
    const url = `${apiBaseUrl}download/`;

    const body = {
        start: startTimestamp / 1000, // ms to s
        end: endTimestamp / 1000,
        agree: checkbox.checked ? 'yes' : 'no',
        email: emailInput.value
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            alertPlaceholder.innerHTML = `<div class="alert alert-danger" role="alert">Error downloading file: ${errorText || response.status}</div>`;
            spinner.classList.add('d-none');
            spinnerText.classList.add('d-none');
            return;
        }

        const blob = await response.blob();

        // Only perform download if response is not empty
        if (blob.size === 0) {
            alertPlaceholder.innerHTML = `<div class="alert alert-warning" role="alert">No data available for the selected date range.</div>`;
            spinner.classList.add('d-none');
            spinnerText.classList.add('d-none');
            return;
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `weather-data-sb-${startDate}-to-${endDate}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
    } catch (error) {
        alertPlaceholder.innerHTML = `<div class="alert alert-danger" role="alert">Error downloading file: ${error.message}</div>`;
    }

    spinner.classList.add('d-none');
    spinnerText.classList.add('d-none');
}

function enableButtons() {
    const checkbox = document.getElementById('acceptTermsYes');
    const emailInput = document.getElementById('email');
    const buttons = document.querySelectorAll('button[type="button"]');

    const isValid = checkbox.checked && emailInput.value.includes('@');

    buttons.forEach(button => {
        button.disabled = !isValid;
    });

}

function initializePage() {
    enableButtons();

    const inputElement = document.getElementById('email');
    inputElement.addEventListener('input', enableButtons);

    const checkboxElement = document.getElementById('acceptTermsYes');
    checkboxElement.addEventListener('change', enableButtons);

    // Set today based on South African Standard Time (UTC+2)
    const today = moment().utcOffset(2).format('YYYY-MM-DD');
    document.getElementById('endDate').setAttribute('max', today);
    document.getElementById('endDate').setAttribute('min', '2021-01-01');
    document.getElementById('startDate').setAttribute('max', today);
    document.getElementById('startDate').setAttribute('min', '2021-01-01');
}

document.addEventListener('DOMContentLoaded', initializePage);

