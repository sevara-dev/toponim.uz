// Initialize the map with coordinates for Nurota Tumani
var map = L.map('map').setView([40.5, 66.5], 9);

// Add OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define base layers
const baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
    "Stadia": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png'),
    "OpenTopoMap": L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png')
};

// Define colors for each type
const typeColors = {
    'Shahar': '#1e88e5',
    'Shaharcha': '#2196f3',
    'Qishloq': '#43a047',
    'Aholi punkti': '#6d4c41',
    'Mahalla': '#fdd835',
    'Ko\'cha': '#ff9800',
    'Marmar koni': '#795548',
    'Oltin koni': '#ffd700',
    'Volfram koni': '#607d8b',
    'Urochishe': '#9c27b0',
    'Do\'nglik': '#8d6e63',
    'Quruq o\'zan': '#795548',
    'Tog\'': '#5d4037',
    'Tog\'lar': '#4e342e',
    'Daryo': '#00acc1',
    'Buloq': '#26c6da',
    'Dovon': '#7e57c2',
    'Ko\'l': '#29b6f6',
    'Ko\'chki': '#66bb6a',
    'Qo\'rg\'on': '#8e24aa',
    'Tog\' tizmasi': '#3e2723',
    'Yuvilma o\'yiq': '#6a1b9a',
    'Other': '#757575'
};

// Create overlay layers with custom labels
const overlayLayers = {};
Object.entries(typeColors).forEach(([type, color]) => {
    overlayLayers[`<div style="display: flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 8px; border: 2px solid white;"></span>${type}</div>`] = L.layerGroup();
});

// Add layer control to map
L.control.layers(baseLayers, overlayLayers, {
    position: 'bottomleft',
    collapsed: true
}).addTo(map);

// Set default base layer
baseLayers["OpenStreetMap"].addTo(map);

// Add custom styles for layer control
const style = document.createElement('style');
style.textContent = `
    .leaflet-control-layers {
        border-radius: 4px;
        background: white;
        box-shadow: 0 1px 5px rgba(0,0,0,0.4);
    }
    .leaflet-control-layers-toggle {
        width: 36px;
        height: 36px;
        background-color: white;
        border-radius: 4px;
        cursor: pointer;
    }
    .leaflet-control-layers-expanded {
        padding: 6px 10px 6px 6px;
        max-height: 70vh;
        overflow-y: auto;
        min-width: 200px;
    }
    .leaflet-control-layers label {
        margin-bottom: 5px;
        display: flex;
        align-items: center;
    }
    .leaflet-control-layers input[type="radio"],
    .leaflet-control-layers input[type="checkbox"] {
        margin-right: 5px;
    }
    .leaflet-control-layers-overlays label div {
        display: flex;
        align-items: center;
        font-size: 14px;
    }
    .toponim-label {
        background: none;
        border: none;
        box-shadow: none;
        font-size: 12px;
        font-weight: bold;
        color: #333;
        text-shadow: 
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff;
        white-space: nowrap;
        margin-left: 15px;
    }
`;
document.head.appendChild(style);

// Fetch the boundary coordinates from the JSON file and add to the map
fetch('nurota-boundary.json')
    .then(response => response.json())
    .then(data => {
        var boundaryCoords = data.geometries[0].coordinates[0].map(coord => [coord[1], coord[0]]);
        L.polygon(boundaryCoords, {
            color: 'blue',
            fillColor: 'lightblue',
            fillOpacity: 0.5
        }).addTo(map);
    })
    .catch(error => {
        console.error('Error loading the boundary data:', error);
    });

// Load toponyms from API
async function loadToponyms() {
    try {
        const response = await fetch('http://localhost:8000/districts/1/toponims/');
        if (!response.ok) throw new Error('Toponimlarni yuklashda xatolik');
        
        const toponyms = await response.json();
        
        // Clear existing markers
        Object.values(overlayLayers).forEach(group => group.clearLayers());
        
        // Add markers to appropriate groups
        toponyms.forEach(toponym => {
            const type = toponym.type || 'Other';
            const layerKey = Object.keys(overlayLayers).find(key => key.includes(type));
            const group = overlayLayers[layerKey];
            
            if (group) {
                // Create marker
                const marker = L.marker([toponym.latitude, toponym.longitude], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="background-color: ${typeColors[type]}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`
                    })
                });

                // Add popup
                marker.bindPopup(`
                    <div class="toponim-popup">
                        <h3>${toponym.name}</h3>
                        <p><strong>Turi:</strong> ${type}</p>
                        <p><strong>Tashkil topgan yili:</strong> ${toponym.established || 'Ma\'lumot yo\'q'}</p>
                        <p><strong>Oldingi nomi:</strong> ${toponym.previous_name || 'Ma\'lumot yo\'q'}</p>
                        <p><strong>Ma'nosi:</strong> ${toponym.meaning || 'Ma\'lumot yo\'q'}</p>
                    </div>
                `);

                // Add label
                const label = L.marker([toponym.latitude, toponym.longitude], {
                    icon: L.divIcon({
                        className: 'toponim-label',
                        html: toponym.name,
                        iconSize: null,
                        iconAnchor: [-10, 0]
                    })
                });

                // Add both marker and label to the group
                group.addLayer(marker);
                group.addLayer(label);
            }
        });

        // Add all groups to map by default
        Object.values(overlayLayers).forEach(group => group.addTo(map));
        
        // Update the list
        updateToponymList(toponyms);
    } catch (error) {
        console.error('Xatolik:', error);
    }
}

// Update toponym list
function updateToponymList(toponyms) {
    const list = document.getElementById('toponymList');
    list.innerHTML = '';

    toponyms.forEach(toponym => {
        const type = toponym.type || 'Other';
        const li = document.createElement('li');
        li.className = 'toponim-item';
        li.innerHTML = `
            <span class="toponim-name">${toponym.name}</span>
            <span class="toponim-type" style="background-color: ${typeColors[type]}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">${type}</span>
        `;
        
        li.addEventListener('click', () => {
            map.setView([toponym.latitude, toponym.longitude], 13);
            const group = overlayLayers[type];
            if (group) {
                const marker = group.getLayers().find(m => 
                    m.getLatLng().lat === toponym.latitude && 
                    m.getLatLng().lng === toponym.longitude
                );
                if (marker) marker.openPopup();
            }
        });
        
        list.appendChild(li);
    });
}

// Search functionality
const searchInput = document.getElementById('toponymSearch');
const clearButton = document.getElementById('clearSearch');

searchInput.addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    clearButton.style.display = searchText ? 'block' : 'none';
    
    const items = document.querySelectorAll('.toponim-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchText) ? 'flex' : 'none';
    });
});

clearButton.addEventListener('click', function() {
    searchInput.value = '';
    clearButton.style.display = 'none';
    document.querySelectorAll('.toponim-item').forEach(item => {
        item.style.display = 'flex';
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', loadToponyms);

// Toggle right sidebar
const toggleButton = document.getElementById('toggleRightSidebar');
const rightSidebar = document.getElementById('rightSidebar');

toggleButton.addEventListener('click', function() {
    rightSidebar.classList.toggle('open');
    toggleButton.classList.toggle('open');
});

