// Initialize Leaflet Map for Toponim Section
var map = L.map('map').setView([41.292, 64.341], 10); // Coordinates for Navoiy

// Add Relief Natural Map Tile Layer without labels and boundaries
L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    opacity: 0.7
}).addTo(map);

// Add terrain layer
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    opacity: 0.3
}).addTo(map);

// Define colors array globally
var colors = {
    'Nurota tumani': '#FF6B6B',
    'Navoiy shahar': '#4ECDC4',
    'Qiziltepa tumani': '#45B7D1',
    'Karmana tumani': '#96CEB4',
    'Navbahor tumani': '#FFEEAD',
    'Xatirchi tumani': '#D4A5A5',
    'Uchquduq tumani': '#9B59B6',
    'Konimex tumani': '#3498DB',
    'Tomdi tumani': '#E67E22'
};

// Define district names for each geometry
var districtNames = [
    'Nurota tumani',
    'Navoiy shahar',
    'Qiziltepa tumani',
    'Karmana tumani',
    'Navbahor tumani',
    'Xatirchi tumani',
    'Uchquduq tumani',
    'Konimex tumani',
    'Tomdi tumani',
    'Navoiy viloyati'
];

// Load Navoiy boundary GeoJSON
fetch('navoiy-viloyati/navoiy-boundary.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('GeoJSON faylini yuklashda xatolik yuz berdi');
        }
        return response.json();
    })
    .then(data => {
        console.log('GeoJSON ma\'lumotlari yuklandi:', data);
        
        // Convert GeometryCollection to FeatureCollection
        var features = data.geometries.map(function(geometry, index) {
            return {
                type: 'Feature',
                properties: {
                    name: districtNames[index]
                },
                geometry: geometry
            };
        });

        var featureCollection = {
            type: 'FeatureCollection',
            features: features
        };

        // Add district boundaries
        var navoiyBoundary = L.geoJSON(featureCollection, {
            style: function(feature) {
                var color = colors[feature.properties.name] || '#ccc';
                console.log('Tuman:', feature.properties.name, 'Rang:', color);
                return {
                    color: color,
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6
                };
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup(feature.properties.name);
                layer.on('mouseover', function(e) {
                    var layer = e.target;
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                });
                layer.on('mouseout', function(e) {
                    var layer = e.target;
                    layer.setStyle({
                        fillOpacity: 0.6
                    });
                });
            }
        }).addTo(map);

        // Add region boundary (last feature)
        var regionBoundary = L.geoJSON(features[features.length - 1], {
            style: {
                color: '#000',
                weight: 3,
                opacity: 1,
                fillOpacity: 0,
                dashArray: '5, 10'
            }
        }).addTo(map);

        // Fit the map to the Navoiy boundary
        var bounds = navoiyBoundary.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds);
        } else {
            console.error("Xarita chegaralari noto'g'ri");
        }
    })
    .catch(error => {
        console.error('GeoJSON yuklashda xatolik:', error);
    });

// Add legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '8px';
    div.style.borderRadius = '3px';
    div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    div.style.maxWidth = '200px';
    div.style.width = 'auto';
    
    // Add toggle button
    var toggleButton = L.DomUtil.create('button', 'legend-toggle');
    toggleButton.innerHTML = 'Viloyat tumanlari';
    toggleButton.style.width = '100%';
    toggleButton.style.padding = '6px';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '2px';
    toggleButton.style.backgroundColor = '#1b2181';
    toggleButton.style.color = 'white';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.fontSize = '12px';
    toggleButton.style.whiteSpace = 'nowrap';
    toggleButton.style.overflow = 'hidden';
    toggleButton.style.textOverflow = 'ellipsis';
    
    // Create content div
    var content = L.DomUtil.create('div', 'legend-content');
    content.style.display = 'none';
    content.style.maxHeight = '200px';
    content.style.overflowY = 'auto';
    
    // Add district colors
    for (var district in colors) {
        var districtDiv = L.DomUtil.create('div', 'district-item');
        districtDiv.style.margin = '2px 0';
        districtDiv.style.fontSize = '11px';
        districtDiv.style.whiteSpace = 'nowrap';
        districtDiv.style.overflow = 'hidden';
        districtDiv.style.textOverflow = 'ellipsis';
        
        var colorBox = L.DomUtil.create('i', 'color-box');
        colorBox.style.background = colors[district];
        colorBox.style.width = '12px';
        colorBox.style.height = '12px';
        colorBox.style.display = 'inline-block';
        colorBox.style.marginRight = '3px';
        colorBox.style.verticalAlign = 'middle';
        
        var districtName = L.DomUtil.create('span', 'district-name');
        districtName.textContent = district;
        
        districtDiv.appendChild(colorBox);
        districtDiv.appendChild(districtName);
        content.appendChild(districtDiv);
    }
    
    // Add toggle functionality
    toggleButton.onclick = function() {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleButton.style.backgroundColor = '#1b2181';
        } else {
            content.style.display = 'none';
            toggleButton.style.backgroundColor = '#1b2181';
        }
    };
    
    div.appendChild(toggleButton);
    div.appendChild(content);
    
    return div;
};

legend.addTo(map);

// Function to update the map with markers based on selected district
function updateMapForDistrict(district) {
    var districtCoordinates = {
        'Navoiy': [41.292, 64.341],
        'Zarafshon': [40.387, 64.016],
        'Karmana': [41.403, 65.350],
        'Uchquduq': [41.694, 64.474],
        'Nurota': [40.812, 65.303],
        'Tomdi': [40.741, 64.991]
    };

    // Remove existing markers
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add a new marker based on the selected district
    if (districtCoordinates[district]) {
        var newMarker = L.marker(districtCoordinates[district]).addTo(map)
            .bindPopup(district)
            .openPopup();

        // Set map view to the new district coordinates
        map.setView(districtCoordinates[district], 10);
    }
}

// Search Button Functionality
document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const searchText = document.getElementById('searchInput').value;
    
    if (!searchText) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/search?q=${searchText}&region=navoiy`);
        const results = await response.json();
        
        // Remove existing markers
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add markers for each result
        results.forEach(result => {
            if (result.latitude && result.longitude) {
                var marker = L.marker([result.latitude, result.longitude]).addTo(map);
                
                // Create popup content with smaller size
                var popupContent = `
                    <div style="padding: 5px; max-width: 200px;">
                        <h4 style="margin: 0 0 5px 0; font-size: 14px;">${result.name}</h4>
                        <p style="margin: 2px 0; font-size: 12px;"><strong>Turi:</strong> ${result.type}</p>
                        <p style="margin: 2px 0; font-size: 12px;"><strong>Tuman:</strong> ${result.district}</p>
                        ${result.meaning ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Ma'nosi:</strong> ${result.meaning}</p>` : ''}
                    </div>
                `;
                
                marker.bindPopup(popupContent, {
                    maxWidth: 200,
                    className: 'custom-popup'
                });
                
                // If this is the first result, center the map on it
                if (results.indexOf(result) === 0) {
                    map.setView([result.latitude, result.longitude], 12);
                }
            }
        });
    } catch (error) {
        console.error('Qidiruv xatosi:', error);
    }
});

// Update map markers based on district cards
document.querySelectorAll('.district-card').forEach(function(card) {
    card.addEventListener('click', function() {
        var district = card.getAttribute('data-district');
        updateMapForDistrict(district);
    });
});


