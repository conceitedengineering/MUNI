document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bus19').addEventListener('click', () => {
        fetchBusTimes('14128');
        toggleButtonState('bus19');
    });
    document.getElementById('bus48').addEventListener('click', () => {
        fetchBusTimes('13507');
        toggleButtonState('bus48');
    });
});

function fetchBusTimes(stopId) {
    const API_ENDPOINT = `https://api.511.org/transit/StopMonitoring?api_key=8ed0464e-6f76-440e-8038-6f300c697f7c&agency=SF&stopCode=${stopId}`;
    fetch(API_ENDPOINT)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const monitoredStopVisits = data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;
            displayBusTimes(monitoredStopVisits);
        })
        .catch(error => {
            console.error('Error fetching bus times:', error);
            document.getElementById('busTimes').textContent = 'Error fetching bus times.';
        });
}

function toggleButtonState(selectedButtonId) {
    document.querySelectorAll('.button').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById(selectedButtonId).classList.add('selected');
}

function displayBusTimes(monitoredStopVisits) {
    const busTimesElement = document.getElementById('busTimes');
    busTimesElement.innerHTML = '';

    if (!Array.isArray(monitoredStopVisits) || monitoredStopVisits.length === 0) {
        busTimesElement.textContent = 'No bus times available.';
        return;
    }

    monitoredStopVisits.forEach(visit => {
        const journey = visit.MonitoredVehicleJourney;
        const lineRef = journey.LineRef;
        const destination = journey.DestinationName;
        const expectedArrival = journey.MonitoredCall.ExpectedArrivalTime;

        

        const arrivalTimeDate = new Date(expectedArrival);
        const timeFromNow = Math.round((arrivalTimeDate - new Date()) / 60000);
        const displayTimeFromNow = timeFromNow < 0 ? "Arrived" : `${timeFromNow} min`;

        const timeElement = document.createElement('div');
        timeElement.classList.add('bus-time-entry', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-center', 'sm:justify-between', 'bg-white', 'shadow', 'rounded', 'mb-6', 'p-1', 'w-full');
        timeElement.style.padding = '1.5rem'; // This applies padding to all sides

        timeElement.innerHTML = `
        <div class="line text-7xl mb-2 sm:mb-0" style="min-width: 80px;">
            <span class="font-bold">${lineRef}</span>
        </div>
        <div class="details flex-grow flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center">
            <div class="destination text-5xl sm:text-5xl mb-2 sm:mb-0 sm:mr-2" style="min-width: 150px;"> <!-- Updated text size -->
                <span>${destination}</span>
            </div>
            <div class="arrival-time text-2xl mb-2 sm:mb-0 sm:mr-2" style="min-width: 120px;">
                <span>${arrivalTimeDate.toLocaleTimeString()}</span>
            </div>
        </div>
        <div class="time-from-now text-3xl md:text-2xl mb-2 sm:mb-0" style="min-width: 80px;">
            <span class="font-bold">${displayTimeFromNow}</span>
        </div>
    `;
        busTimesElement.appendChild(timeElement);
    });
}
