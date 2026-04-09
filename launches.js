// API Endpoint for DEV Launch Library (Free, no auth)
const API_URL = 'https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=10';

let nextLaunchDate = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', fetchLaunches);

async function fetchLaunches() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Find the first launch in the future
            const now = new Date();
            const futureLaunches = data.results.filter(launch => new Date(launch.net) > now);
            
            // If all returned are in the past, fall back to the first one available, 
            // otherwise use the first future one.
            const nextLaunch = futureLaunches.length > 0 ? futureLaunches[0] : data.results[0];
            
            setupHeroCountdown(nextLaunch);
            
            // Populate the rest of the schedule
            populateSchedule(data.results);
        } else {
            showError("No upcoming launches found.");
        }
    } catch (error) {
        console.error("Error fetching launches:", error);
        showError("Failed to connect to monitoring station. Launch data unavailable.");
    }
}

function setupHeroCountdown(launch) {
    document.getElementById('next-mission-name').innerText = launch.name;
    
    const rocketType = launch.rocket?.configuration?.name || "Unknown Rocket";
    const padName = launch.pad?.name || launch.pad?.location?.name || "Unknown Site";
    document.getElementById('next-rocket-info').innerText = `${rocketType} • ${padName}`;
    
    nextLaunchDate = new Date(launch.net).getTime();
    
    // Clear any existing interval, start fresh
    if (timerInterval) clearInterval(timerInterval);
    updateCountdown(); // Call immediately
    timerInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!nextLaunchDate) return;
    
    const now = new Date().getTime();
    const distance = nextLaunchDate - now;

    if (distance < 0) {
        // Launch passed! Stop asking
        clearInterval(timerInterval);
        document.getElementById('t-days').innerText = "00";
        document.getElementById('t-hours').innerText = "00";
        document.getElementById('t-mins').innerText = "00";
        document.getElementById('t-secs').innerText = "00";
        document.querySelector('.live-pulse').innerHTML = `<span class="dot" style="background:#0F0"></span> IN FLIGHT / LIFTOFF`;
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('t-days').innerText = String(days).padStart(2, '0');
    document.getElementById('t-hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('t-mins').innerText = String(minutes).padStart(2, '0');
    document.getElementById('t-secs').innerText = String(seconds).padStart(2, '0');
}

function populateSchedule(launches) {
    const grid = document.getElementById('launch-grid');
    grid.innerHTML = ''; // clear loading state
    
    launches.forEach((launch, index) => {
        // Skip the very first one optionally if it's in the hero
        // But it's nice to see it in the list too. Let's show all.
        const card = document.createElement('div');
        card.className = 'launch-card glass';
        
        const missionName = launch.name;
        const rocketType = launch.rocket?.configuration?.name || "Unknown Rocket";
        const location = launch.pad?.location?.name || "Unknown Site";
        
        // Format Date
        const dateObj = new Date(launch.net);
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        const dateString = dateObj.toLocaleDateString(undefined, options);

        card.innerHTML = `
            <div class="m-name">${missionName}</div>
            <div class="r-type">${rocketType}</div>
            <div class="site">📍 ${location}</div>
            <div class="date">${dateString}</div>
        `;
        
        grid.appendChild(card);
    });
}

function showError(msg) {
    document.getElementById('next-mission-name').innerText = "API Error";
    document.getElementById('next-rocket-info').innerText = msg;
    document.getElementById('launch-grid').innerHTML = '<p style="color:var(--text-dim)">&nbsp;&nbsp;Data temporarily disconnected.</p>';
}
