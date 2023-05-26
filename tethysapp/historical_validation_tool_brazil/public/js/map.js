// ------------------------------------------------------------------------------------------------------------ //
//                                          GLOBAL AND STATE VARIABLES                                          //
// ------------------------------------------------------------------------------------------------------------ //

// Server domain (DNS or IP:port)
const server = "http://localhost:8080";




// ------------------------------------------------------------------------------------------------------------ //
//                                              INITIALIZE THE MAP                                              //
// ------------------------------------------------------------------------------------------------------------ //

// Ajust the map to the window height
const height = $(window).height() - 50;
$("#map-container").height(height);

// Set the map container
var map = L.map("map-container", {
    zoomControl: false,
}).setView([-9.8, -53.4], 5);

// Add the base map
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);


// Add river network
riv = L.tileLayer.wms('https://geoserver.hydroshare.org/geoserver/HS-11765271903a45d483416ce57bf8c710/wms', {
        layers: 'south_america-brazil-geoglows-drainage_line',
        format: 'image/png',
        transparent: true,
        opacity: 0.5
    }).addTo(map); 

// Create and ajust the bounds manually
var southwest = L.latLng(-32.52, -77.81); // Example coordinates for the southwest corner
var northeast = L.latLng(4.63, -40.03);  // Example coordinates for the northeast corner
var bounds = L.latLngBounds(southwest, northeast);
map.fitBounds(bounds)


// Add the zoom control
L.control.zoom({ 
    position: "bottomright"
}).addTo(map);


// ------------------------------------------------------------------------------------------------------------ //
//                                     COLOR MARKER ACCORDING TO THE ALERT                                      //
// ------------------------------------------------------------------------------------------------------------ //

// Function to construct Icon Marker
function IconMarker(rp) {
  const IconMarkerR = new L.Icon({
    iconUrl: `${server}/static/historical_validation_tool_brazil/images/icon_popup/${rp}.png`,
    shadowUrl: `${server}/static/historical_validation_tool_brazil/images/icon_popup/marker-shadow.png`,
    iconSize: [9, 14],
    iconAnchor: [5, 14],
    popupAnchor: [1, -14],
    shadowSize: [14, 14],
  });
  return IconMarkerR;
}

// Icon markers for each return period
const IconR000 = IconMarker("0");       // RP: 0 years
const IconR002 = IconMarker("2");      // RP: 2 years
const IconR005 = IconMarker("5");        // RP: 5 years
const IconR010 = IconMarker("10");      // RP: 10 years
const IconR025 = IconMarker("25");         // RP: 25 years
const IconR050 = IconMarker("50");      // RP: 50 years
const IconR100 = IconMarker("100");       // RP: 100 years

// Customized icon function
function IconParse(feature, latlng) {
    switch (feature.properties.alert) {
        case "R0":
            StationIcon = IconR000;
            break;
        case "R2":
            StationIcon = IconR002;
            break;
        case "R5":
            StationIcon = IconR005;
            break;
        case "R10":
            StationIcon = IconR010;
            break;
        case "R25":
            StationIcon = IconR025;
            break;
        case "R50":
            StationIcon = IconR050;
            break;
        case "R100":
            StationIcon = IconR100;
            break;
    }
    return L.marker(latlng, { icon: StationIcon });
}



// ------------------------------------------------------------------------------------------------------------ //
//                                            PANEL DATA INFORMATION                                            //
// ------------------------------------------------------------------------------------------------------------ //
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get_data_station(code, comid, name, river, basin, latitude, longitude, altitude, locality1){
    // Add data to the panel
    $("#panel-title-custom").html(`${code.toUpperCase()} - ${name.toUpperCase()}`)
    $("#station-comid-custom").html(`<b>COMID:</b> &nbsp ${comid}`)
    $("#station-river-custom").html(`<b>RIVER:</b> &nbsp ${river.toUpperCase()}`)
    $("#station-latitude-custom").html(`<b>LATITUDE:</b> &nbsp ${latitude.toUpperCase()}`)
    $("#station-longitude-custom").html(`<b>LONGITUDE:</b> &nbsp ${longitude.toUpperCase()}`)
    $("#station-altitude-custom").html(`<b>ALTITUDE:</b> &nbsp ${altitude.toUpperCase()} msnm`)
    $("#station-locality1-custom").html(`<b>MUNICIPALITY:</b> &nbsp ${locality1.toUpperCase()}`)

    loader = `<div class="loading-container" style="height: 350px; padding-top: 12px;"> 
                        <div class="loading"> 
                        <h2>LOADIND DATA</h2>
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span> 
                        </div>
                    </div>`;

    // Add the dynamic loader
    $("#hydrograph").html(loader)
    $("#visual-analisis").html(loader)
    $("#metrics").html(loader)
    $("#forecast").html(loader)
    $("#corrected-forecast").html(loader)

    // We need stop 300ms to obtain the width of the panel-tab-content
    await sleep(300);

    // Retrieve the data
    $.ajax({
        type: 'GET', 
        url: "get-data",
        data: {
            codigo: code.toLowerCase(),
            comid: comid,
            nombre: name.toUpperCase(),
            width: `${$("#panel-tab-content").width()}`
        }
    }).done(function(response){
        // Render the panel data
        $("#modal-body-panel-custom").html(response);

        // Set active variables for panel data
        active_code = code.toLowerCase();
        active_comid = comid;
        active_name = name.toUpperCase();
    })
}



// ------------------------------------------------------------------------------------------------------------ //
//                                          INFORMATION ABOUT STATIONS                                          //
// ------------------------------------------------------------------------------------------------------------ //

// Dinamic popups
function onEachFeature(feature, layer) {
    layer.bindPopup(
        "<div class='popup-container'>"+
            "<div class='popup-title'><b> STATION INFORMATION </b></div>"+
               "<table style='font-size:12px'>"+
                "<tbody>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>CODE: </th>"+
                        "<td class='popup-cell'>" + feature.properties.code + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>NAME: </th>"+
                        "<td class='popup-cell'>" + feature.properties.name.toUpperCase().slice(0,20) + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>RIVER: </th>"+
                        "<td class='popup-cell'>" + feature.properties.river + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>BASIN: </th>"+
                        "<td class='popup-cell'>" + feature.properties.basin + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>LATITUDE: </th>"+
                        "<td class='popup-cell'>" + round10(parseFloat(feature.geometry.coordinates[1]), -4) + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>LONGITUDE: </th>"+
                        "<td class='popup-cell'>" + round10(parseFloat(feature.geometry.coordinates[0]), -4) + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>ALTITUDE: </th>"+
                        "<td class='popup-cell'>" + feature.properties.elevation + " msnm</td>"+ 
                    "</tr>"+
                "</tbody>"+
            "</table>"+ 
            "<br>"+ 
            
            "<div data-bs-toggle='tooltip'>"+
                "<div data-bs-toggle='modal' data-bs-target='#panel-modal'>" + 
                    "<button style='font-size:14px !important;' class='btn btn-primary popup-button' onclick='get_data_station(" + 
                        '"' + feature.properties.code + '",' +
                        '"' + feature.properties.comid + '",' +
                        '"' + feature.properties.name + '",' + 
                        '"' + feature.properties.river + '",' + 
                        '"' + feature.properties.basin + '",' + 
                        '"' + round10(parseFloat(feature.geometry.coordinates[1]), -4) + '",' + 
                        '"' + round10(parseFloat(feature.geometry.coordinates[0]), -4) + '",' + 
                        '"' + feature.properties.elevation + '",' + 
                        '"' + feature.properties.loc1 + '",' +
                    ");' >"+
                        "<i class='fa fa-download'></i>&nbsp;Visualize data"+
                    "</button>"+
                "</div>"+ 
            "</div>"+
        "</div>");
    layer.openPopup();
};



window.onload = function () { 
  // Update the map zoom 
  map.setZoom(5)  

  // Load stations 
  fetch("get-stations")
    .then((response) => (layer = response.json()))
    .then((layer) => {
        est_layer = layer.features.map(item => item.properties);
        
        // Filter by alert
        est_R000 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R0"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R000.addTo(map);

        est_R002 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R2"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R002.addTo(map);

        est_R005 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R5"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R005.addTo(map);

        est_R010 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R10"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R010.addTo(map);

        est_R025 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R25"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R025.addTo(map);

        est_R050 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R50"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R050.addTo(map);

        est_R100 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R100"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R100.addTo(map);

    });
};















