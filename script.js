let bus19Data = [];
let bus48Data = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bus19').addEventListener('click', () => {
        displayBusTimes(bus19Data, 'bus19');
        toggleButtonState('bus19');
    });
    document.getElementById('bus48').addEventListener('click', () => {
        displayBusTimes(bus48Data, 'bus48');
        toggleButtonState('bus48');
    });

    // Fetch data for both buses on initial load
    fetchBusTimes('14128', 'bus19');
    fetchBusTimes('13507', 'bus48');
});

function fetchBusTimes(stopId, busId) {
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
            if (busId === 'bus19') {
                bus19Data = monitoredStopVisits;
            } else {
                bus48Data = monitoredStopVisits;
            }
            displayBusTimes([...bus19Data, ...bus48Data]);
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

function displayBusTimes(monitoredStopVisits, selectedBusId) {
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
        timeElement.classList.add('bus-time-entry', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-center', 'sm:justify-between', 'bg-white', 'shadow', 'rounded', 'mb-6', 'p-', 'w-full');
        timeElement.style.padding = '1.5rem'; // This applies padding to all sides

        timeElement.innerHTML = `
            <div class="line text-7xl mb-2 sm:mb-0" style="min-width: 80px;">
                <span class="font-bold">${lineRef}</span>
            </div>
            <div class="details flex-grow flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center">
                <div class="destination text-5xl sm:text-5xl mb-2 sm:mb-0 sm:mr-2" style="min-width: 150px;">
                    <span>${destination}</span>
                </div>
                <div class="arrival-time text-2xl mb-2 sm:mb-0 sm:mr-2" style="min-width: 120px;">
                    <span>${arrivalTimeDate.toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="time-from-now text-6xl md:text-6xl mb-2 sm:mb-0" style="min-width: 80px;">
                <span class="font-bold">${displayTimeFromNow}</span>
            </div>
        `;
        busTimesElement.appendChild(timeElement);
    });
}
