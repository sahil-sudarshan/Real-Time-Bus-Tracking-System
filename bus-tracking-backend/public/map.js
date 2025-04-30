let map;
let busMarkers = {};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.6448, lng: 77.2167 }, // Default center
    zoom: 14,
  });

  //const socket = io();
  // ❌ This connects to the current domain (5500), which is wrong
const socket = io("http://localhost:3000"); // Or the exact port your backend uses


  socket.on("busLocationUpdate", (data) => {
    const { busId, lat, lng } = data;

    // If marker exists, move it
    if (busMarkers[busId]) {
        const marker = busMarkers[busId];
        marker.setPosition({ lat, lng });
        marker.setAnimation(google.maps.Animation.BOUNCE);  // Bounce animation

        setTimeout(() => {
            marker.setAnimation(null);
          }, 1400); 
    } else {
      // Else, create a new marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: busId,
        icon: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
        scaledSize: new google.maps.Size(40, 40),
      });
      busMarkers[busId] = marker;
    }
  });
}

// Wait for Google Maps to load before initializing
window.initMap = initMap;
