let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 2,
    center: new google.maps.LatLng(2.8, -187.3),
    mapTypeId: "terrain",
  });

  // Create a <script> tag and set the USGS URL as the source.
  const script = document.createElement("script");

  // This example uses a local copy of the GeoJSON stored at
  // http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp
  script.src =
    "https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js";
  document.getElementsByTagName("head")[0].appendChild(script);
}

let fetchLocations = async () => {
  const response = await fetch(`http://localhost:3000/v1/hotspot_loc/all`);
  const data = await response.json();
  
  return data;
}

// Loop through the results array and place a marker for each
// set of coordinates.
const eqfeed_callback = async function (results) {
  let data = await fetchLocations();
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    if(data[i].latitude != null || data[i].longitude != null ){
      const latLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);
  
      new google.maps.Marker({
        position: latLng,
        map: map,
      });
    }
  }
};

window.initMap = initMap;
window.eqfeed_callback = eqfeed_callback;