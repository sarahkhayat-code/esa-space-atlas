const tableBody = document.querySelector('#agencyTable tbody');
const entryCount = document.querySelector('#entryCount');

const map = L.map('map', {
  minZoom: 2,
  maxZoom: 18,
}).setView([52.2, 10.8], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

const markers = agencyData.map((agency, index) => {
  const marker = L.marker([agency.latitude, agency.longitude]).addTo(map);
  marker.bindPopup(`<strong>${agency.name}</strong><br>${agency.city}, ${agency.country}<br>${agency.address}`);

  marker.on('click', () => {
    map.flyTo([agency.latitude, agency.longitude], 7, { duration: 1.2 });
  });

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${agency.name}</td>
    <td>${agency.city}</td>
    <td>${agency.country}</td>
    <td>${agency.address}</td>
    <td>${agency.latitude.toFixed(6)}</td>
    <td>${agency.longitude.toFixed(6)}</td>
  `;

  row.addEventListener('click', () => {
    map.flyTo([agency.latitude, agency.longitude], 7, { duration: 1.2 });
    marker.openPopup();
  });

  tableBody.appendChild(row);
  return marker;
});

entryCount.textContent = agencyData.length;
