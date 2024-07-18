// Function to create WMS tile layers
function createWMSLayer(layerName) {
    return L.tileLayer.wms(
        "http://192.168.43.177:8080/geoserver/Maseno_University/wms", {
            layers: layerName,
            format: "image/png",
            transparent: true,
            version: "1.1.0",
            tiled: true
        }
    );
}

// Defining layer names
var layerNames = {
    'Hostels': 'Maseno_University:Hostels',
    'Offices': 'Maseno_University:Offices',
    'Playground': 'Maseno_University:Playground',
    'Roads': 'Maseno_University:Roads',
    'NewLibrary':'Maseno_University:NewLibrary',
    'NewTutionBlock':'Maseno_University:NewTutionBlock',
    'LectureHalls':'Maseno_University:LectureHalls',
    'Boardroom':'Maseno_University:Boardroom',
    'CabrosPavements':'Maseno_University:CabrosPavements',
    'AgriculturalStructures':'Maseno_University:AgriculturalStructures',
    'Hospital':'Maseno_University:Hospital',
    'UtilitiesLineFeatures':'Maseno_University:UtilitiesLineFeatures',
    'UtilitiesPointFeatures':'Maseno_University:UtilitiesPointFeatures',
    'UtilitiesPolygonFeatures':'Maseno_University:UtilitiesPolygonFeatures',
    'Laboratory':'Maseno_University:Laboratory',
    'RESIDENTIALS':'Maseno_University:RESIDENTIALS',
    'Vegetation':'Maseno_University:Vegetation',
    'Agriculture':'	Maseno_University:Agriculture',
};

// Creating overlay layers
var overlayMaps = {};
Object.keys(layerNames).forEach(function(key) {
    overlayMaps[key] = createWMSLayer(layerNames[key]);
});

// Defining basemaps
var basemaps = {
    'OSM': L.tileLayer.provider("OpenStreetMap.Mapnik"),
    'Stadia Map': L.tileLayer.provider("Stadia.AlidadeSmoothDark"),
    "Esri Imagery": L.tileLayer.provider("Esri.WorldImagery"),
    "Thunder": L.tileLayer.provider("OpenTopoMap")
};

// Create the map
var map = L.map('map', {
    center: [-0.00613, 34.60307],
    zoom: 18,
    layers: [basemaps['Esri Imagery']] // Default basemap
});

// Add layer control
var mapLayers = L.control.layers(basemaps, overlayMaps).addTo(map);

var geoJsonLayer; // Declare a global variable to hold the GeoJSON layer



// Event listener to automatically select attribute name based on the selected layer
$('#layerSelect').change(function() {
    var layerName = $(this).val();
    // Get the layer name from the selected option
    var layer = layerNames[layerName];
    // Split the layer name to extract the actual layer name
    var actualLayerName = layer.split(':')[1];
    // Fetch attribute names associated with the actual layer name
    var attributeNames = getAttributeNames(actualLayerName);
    // Set the value of the attributeName input field
    $('#attributeName').empty(); // Clear previous options
    attributeNames.forEach(function(attribute) {
        $('#attributeName').append($('<option>', {
            value: attribute,
            text: attribute
        }));
    });
});

// Function to get attribute names for a given layer
function getAttributeNames(layerName) {
    // Here you need to implement your logic to fetch attribute names associated with the given layer
    // For now, I'm just returning a placeholder array
    // Replace this with your actual implementation
    switch (layerName) {
        case 'Hostels':
            return ['Gender', 'Name','Room_Capacity','id','Floors'];
        case 'Offices':
            return ['Name', 'Services','Working_Days','Working_Hours'];
        case 'Playground':
            return ['Attribute1_Playground', 'Attribute2_Playground', 'Attribute3_Playground'];

        case 'Parking':
            return["name"];

        case 'NewTutionBlock':
            return['Name','Capacity','Purpose','Floor'];
        case 'NewLibrary':
            return['Name','Capacity','Purpose','Floor'];
        case 'LectureHalls':
            return['Name','Capacity','Purpose','Floor'];
        case 'Roads':
            return['Type'];
        case 'UtilitiesLineFeatures':
            return['Type'];
            
        case 'UtilitiesPointFeatures':
            return['Type'];

         case 'UtilitiesPolygonFeatures':
            return['Type'];
        case 'Vegetation':
            return['Type'];
        case 'Agriculture':
            return['Type'];
        // Add cases for other layers as needed
        default:

            return []; // Return empty array if layer name is not recognized
    }
}

// Handle attribute query form submission
$('#submitQuery').click(function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Read input values
    var attributeName = $("#attributeName").val();
    var attributeValue = $("#attributeValue").val();
    var operator = $("#operator").val();
    var layerName = $("#layerSelect").val();

    // Perform attribute query
    performAttributeQuery(attributeName, attributeValue, operator, layerName);
});


function performAttributeQuery(attributeName, attributeValue, operator, layerName) {
    // Construct CQL filter
    var cqlFilter = attributeName + operator + "'" + attributeValue + "'";

    // Construct query URL
    var queryUrl = 'http://192.168.43.177:8080/geoserver/Maseno_University/wfs?' +
        'service=WFS&' +
        'version=1.1.0&' +
        'request=GetFeature&' +
        'typeName=' + layerNames[layerName] + '&' +
        'outputFormat=json&' +
        'cql_filter=' + encodeURIComponent(cqlFilter);

    // Perform AJAX request
    $.ajax({
        url: queryUrl,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            // Handle success
            console.log('Query successful:', response);
            // Converting the response to GeoJSON format
            var geoJsonData = response.features.map(function(feature) {
                return feature.geometry;
            });
            // Remove existing GeoJSON layer if it exists
            if (geoJsonLayer) {
                map.removeLayer(geoJsonLayer);
            }
            // Add GeoJSON layer to the map
            addGeoJSONLayer(geoJsonData);
            // Create attribute table
            createAttributeTable(response.features);
            // Add event listeners to attribute table rows
            addTableRowEventListeners();
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error('Error performing query:', error);
            // Log detailed error information
            console.log('Status:', status);
            console.log('Response Text:', xhr.responseText);
            // Display error message to the user
            alert('Error performing query. Please try again later.');
        }
    });
}

// Function to create an attribute table from GeoJSON features
function createAttributeTable(features) {
    // Check if features exist
    if (!features || features.length === 0) {
        console.log('No features available');
        // Hide the attribute table container if it's empty
        $('#attributeTableContainer').hide();
        return;
    }

    // Clear previous table
    $('#attributeTable').empty();

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Extract attribute names from the first feature
    const attributes = Object.keys(features[0].properties);

    // Create table header row
    const headerRow = document.createElement('tr');
    attributes.forEach(attribute => {
        const th = document.createElement('th');
        th.textContent = attribute;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body rows
    features.forEach(feature => {
        const row = document.createElement('tr');
        attributes.forEach(attribute => {
            const td = document.createElement('td');
            td.textContent = feature.properties[attribute];
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Append table to the container
    $('#attributeTable').append(table);

    // Show the attribute table container
    $('#attributeTableContainer').show();
}


// Function to add GeoJSON data to the map as a layer
function addGeoJSONLayer(geoJsonData) {
    // Create a GeoJSON layer with styling options
    geoJsonLayer = L.geoJSON(geoJsonData, {
        style: function(feature) {
            return {
                fillColor: 'blue', // Example color
                fillOpacity: 0.5,
                color: 'black',
                weight: 1
            };
        }
    });

    // Add the GeoJSON layer to the map
    geoJsonLayer.addTo(map);
}

// Function to get Sentinel data and calculate NDVI
$('#retrieveSentinelData').click(async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Read input values
    const file = $("#geojsonFile")[0].files[0];
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();

    try {
        const area = await readGeoJSONFile(file);
        // Fetch Sentinel data
        fetchSentinelData(area, startDate, endDate);
    } catch (error) {
        alert("Error reading GeoJSON file: " + error.message);
    }
});

function fetchSentinelData(area, startDate, endDate) {
    const apiKey = 'c4212189-d9d1-452b-8790-798caa6c0766'; // Your Sentinel Hub API key

    const requestData = {
        input: {
            bounds: {
                properties: {
                    crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
                },
                geometry: area
            },
            data: [
                {
                    type: "sentinel-2-l2a",
                    dataFilter: {
                        timeRange: {
                            from: startDate,
                            to: endDate
                        }
                    }
                }
            ]
        },
        output: {
            width: 512,
            height: 512,
            responses: [
                {
                    identifier: "default",
                    format: {
                        type: "image/tiff"
                    }
                }
            ]
        },
        evalscript: `
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B08"],
                    output: { bands: 2 }
                };
            }

            function evaluatePixel(sample) {
                let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
                return [ndvi];
            }
        `
    };

    $.ajax({
        url: 'https://services.sentinel-hub.com/api/v1/process',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        data: JSON.stringify(requestData),
        success: function(response) {
            // Handle success
            console.log('Sentinel data retrieved successfully:', response);
            // Add NDVI layer to the map
            addNDVILayer(response);
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error('Error retrieving Sentinel data:', error);
            // Log detailed error information
            console.log('Status:', status);
            console.log('Response Text:', xhr.responseText);
            // Display error message to the user
            alert('Error retrieving Sentinel data. Please try again later.');
        }
    });
}

function addNDVILayer(response) {
    var ndviLayer = L.imageOverlay(
        'data:image/tiff;base64,' + response.output.responses[0].content, // Assuming the response contains the image in base64 format
        [[-0.00613, 34.60307], [-0.00613, 34.60307]], // Adjust these coordinates to match your area
        {
            opacity: 0.7,
            attribution: 'Sentinel-2 NDVI'
        }
    );

    ndviLayer.addTo(map);
}