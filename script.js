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
    busTimesElement.classList.add('w-full', 'md:w-3/4', 'lg:w-1/2', 'mx-auto', 'flex', 'flex-col', 'items-center', 'gap-4', 'p-6', 'bg-white', 'shadow', 'rounded');

    monitoredStopVisits.forEach(visit => {
        const journey = visit.MonitoredVehicleJourney;
        const lineRef = journey.LineRef;
        const destination = journey.DestinationName;
        const expectedArrival = journey.MonitoredCall.ExpectedArrivalTime;

        const arrivalTimeDate = new Date(expectedArrival);
        const timeFromNow = Math.round((arrivalTimeDate - new Date()) / 60000);
        const displayTimeFromNow = timeFromNow < 0 ? "Arrived" : `${timeFromNow} min`;

        const timeElement = document.createElement('div');
        timeElement.classList.add('bus-time-entry', 'flex', 'justify-between', 'items-center', 'bg-white', 'shadow', 'rounded', 'mb-4', 'p-5', 'w-full');
        timeElement.innerHTML = `
            <div class="line" style="min-width: 65px;">
                <span class="font-bold text-4xl">${lineRef}</span>
            </div>
            <div class="destination" style="min-width: 135px;">
                <span>${destination}</span>
            </div>
            <div class="arrival-time" style="min-width: 115px;">
                <span>${arrivalTimeDate.toLocaleTimeString()}</span>
            </div>
            <div class="time-from-now" style="min-width: 90px;">
                <span class="text-2xl font-bold">${displayTimeFromNow}</span>
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
