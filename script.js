let busData = {};

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.button');
    const busTimesDiv = document.getElementById('busTimes');

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            
            busTimesDiv.innerHTML = '<p>Loading...</p>';
            
            const stopId = button.getAttribute('data-stop-id');
            const busId = button.id;
            
            try {
                let extraStops = null;
                if (busId === 'bus48-inbound') {
                    const [, specialStops] = await Promise.all([
                        fetchBusTimes(stopId, busId),
                        fetchStopVisits('15554')
                    ]);
                    extraStops = specialStops;
                } else {
                    await fetchBusTimes(stopId, busId);
                }
                displayBusTimes(busData[busId], busId, extraStops);
            } catch (error) {
                console.error('Error fetching bus info:', error);
                busTimesDiv.innerHTML = '<p>Error loading bus times. Please try again.</p>';
            }
        });
    });
});

async function fetchBusTimes(stopId, busId) {
    const API_ENDPOINT = `https://api.511.org/transit/StopMonitoring?api_key=8ed0464e-6f76-440e-8038-6f300c697f7c&agency=SF&stopCode=${stopId}`;
    
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const monitoredStopVisits = data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;
        busData[busId] = monitoredStopVisits;
    } catch (error) {
        console.error('Error fetching bus times:', error);
        throw error;
    }
}

async function fetchStopVisits(stopId) {
    const API_ENDPOINT = `https://api.511.org/transit/StopMonitoring?api_key=8ed0464e-6f76-440e-8038-6f300c697f7c&agency=SF&stopCode=${stopId}`;

    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;
    } catch (error) {
        console.error('Error fetching bus times:', error);
        throw error;
    }
}

function getNextTimesForLine(monitoredStopVisits, lineRef, limit = 2) {
    if (!Array.isArray(monitoredStopVisits)) {
        return [];
    }

    const now = new Date();
    const times = monitoredStopVisits
        .filter(visit => visit.MonitoredVehicleJourney.LineRef === lineRef)
        .map(visit => {
            const expectedArrival = visit.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;
            const arrivalTimeDate = new Date(expectedArrival);
            return Math.round((arrivalTimeDate - now) / 60000);
        })
        .filter(minutes => minutes >= 0)
        .sort((a, b) => a - b);

    return times.slice(0, limit);
}

function createWideShortCard(monitoredStopVisits) {
    const line14Times = getNextTimesForLine(monitoredStopVisits, '14');
    const line49Times = getNextTimesForLine(monitoredStopVisits, '49');

    const line14Text = line14Times.length > 0 ? line14Times.map(time => `<div>${time}</div>`).join('') : '';
    const line49Text = line49Times.length > 0 ? line49Times.map(time => `<div>${time}</div>`).join('') : '';

    const timeElement = document.createElement('div');
    timeElement.classList.add('bus-time-entry', 'wide-short', 'w-full', 'mb-6');

    timeElement.innerHTML = `
        <div class="special-side">
            <span class="line text-6xl font-bold">14</span>
            <div class="time-from-now text-4xl stacked-times">${line14Text}</div>
        </div>
        <div class="special-side">
            <span class="line text-6xl font-bold">49</span>
            <div class="time-from-now text-4xl stacked-times">${line49Text}</div>
        </div>
    `;

    return timeElement;
}

function displayBusTimes(monitoredStopVisits, selectedBusId, extraStops) {
    const busTimesElement = document.getElementById('busTimes');
    busTimesElement.innerHTML = '';

    if (selectedBusId === 'bus48-inbound' && Array.isArray(extraStops)) {
        const wideShortCard = createWideShortCard(extraStops);
        busTimesElement.appendChild(wideShortCard);
    }

    if (!Array.isArray(monitoredStopVisits) || monitoredStopVisits.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No bus times available.';
        busTimesElement.appendChild(emptyMessage);
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

function toggleButtonState(selectedButtonId) {
    document.querySelectorAll('.button').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById(selectedButtonId).classList.add('selected');
}
