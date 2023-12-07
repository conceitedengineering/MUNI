document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bus19').addEventListener('click', () => fetchBusTimes('14128'));
    document.getElementById('bus48').addEventListener('click', () => fetchBusTimes('13507'));
});

// ... Rest of your JavaScript code ...

function handleStopChange() {
    const selectedStopId = this.value;
    fetchBusTimes(selectedStopId);
}

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
            // Extracting the MonitoredStopVisit array
            const monitoredStopVisits = data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;
            displayBusTimes(monitoredStopVisits);
        })
        .catch(error => {
            console.error('Error fetching bus times:', error);
            // Handle error
        });
}

function displayBusTimes(monitoredStopVisits) {
    const busTimesElement = document.getElementById('busTimes');

    if (!Array.isArray(monitoredStopVisits) || monitoredStopVisits.length === 0) {
        busTimesElement.textContent = 'No bus times available.';
        return;
    }

    busTimesElement.innerHTML = ''; // Clear existing content

    monitoredStopVisits.forEach(visit => {
        const journey = visit.MonitoredVehicleJourney;
        const lineRef = journey.LineRef;
        const destination = journey.DestinationName;
        const expectedArrival = journey.MonitoredCall.ExpectedArrivalTime;

        const arrivalTimeDate = new Date(expectedArrival);
        const timeFromNow = Math.round((arrivalTimeDate - new Date()) / 60000); // Convert to minutes
        const displayTimeFromNow = timeFromNow < 0 ? "Arrived" : `${timeFromNow} min`;

        const timeElement = document.createElement('div');
        timeElement.classList.add('bus-time-entry', 'flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-center', 'sm:justify-between', 'bg-white', 'shadow', 'rounded', 'mb-4', 'p-6', 'w-full');
        timeElement.innerHTML = `
            <div class="line text-3xl mb-2 sm:mb-0" style="min-width: 80px;">
                <span class="font-bold">${lineRef}</span>
            </div>
            <div class="details flex-grow flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center">
                <div class="destination text-md mb-2 sm:mb-0 sm:mr-2" style="min-width: 150px;">
                    <span>${destination}</span>
                </div>
                <div class="arrival-time text-xl mb-2 sm:mb-0 sm:mr-2" style="min-width: 120px;">
                    <span>${arrivalTimeDate.toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="time-from-now text-xl md:text-lg mb-2 sm:mb-0" style="min-width: 80px;">
                <span class="font-bold">${displayTimeFromNow}</span>
            </div>
        `;
        busTimesElement.appendChild(timeElement);
    });
}


// Refresh bus times every minute for the selected stop
setInterval(() => {
    const selectedBusStop = document.getElementById('busStopSelector').value;
    if (selectedBusStop) {
        fetchBusTimes(selectedBusStop);
    }
}, 60000); // Refresh every 60 seconds
