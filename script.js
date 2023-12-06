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
    busTimesElement.classList.add('max-w-lg', 'mx-auto', 'flex', 'flex-col', 'items-center', 'gap-4', 'p-4', 'bg-white', 'shadow', 'rounded');

    monitoredStopVisits.forEach(visit => {
        const journey = visit.MonitoredVehicleJourney;
        const lineRef = journey.LineRef;
        const destination = journey.DestinationName;
        const expectedArrival = journey.MonitoredCall.ExpectedArrivalTime;

        const arrivalTimeDate = new Date(expectedArrival);
        const currentTime = new Date();
        const timeDifference = arrivalTimeDate.getTime() - currentTime.getTime();
        const timeFromNow = Math.floor(timeDifference / 60000); // Convert to minutes
        const displayTimeFromNow = timeFromNow < 0 ? "Arrived" : `${timeFromNow} min`;

        const timeElement = document.createElement('div');
        timeElement.classList.add('bus-time-entry', 'flex', 'flex-col', 'md:flex-row', 'justify-between', 'items-center', 'bg-white', 'shadow', 'rounded', 'mb-4', 'p-4', 'w-full');
        timeElement.innerHTML = `
            <div class="line text-2xl mb-2 md:mb-0 flex-1 md:flex-none md:w-1/4">
                <span class="font-bold">${lineRef}</span>
            </div>
            <div class="details flex-1 flex flex-col md:flex-row md:items-center">
                <div class="destination text-lg mb-2 md:mb-0 md:mr-4">
                    <span>${destination}</span>
                </div>
                <div class="arrival-time text-lg mb-2 md:mb-0">
                    <span>${arrivalTimeDate.toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="time-from-now text-xl flex-1 md:flex-none md:w-1/4">
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
