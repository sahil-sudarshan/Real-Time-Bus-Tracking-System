let map;
let busMarkers = {}; // Store bus markers using their unique IDs

// Initialize Google Map
 window.initMap = function() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
    zoom: 12,
    mapId: "DEMO_MAP_ID", // Optional: for custom map styles
  });

  // Connect to your Socket.IO backend
  const socket = io('http://localhost:3000'); // Replace with deployed URL if needed

  // Listen for live bus location updates
  socket.on("busLocationUpdate", (data) => {
    const { busId, lat, lng } = data;

    if (busMarkers[busId]) {
      // Update existing marker
      busMarkers[busId].setPosition(new google.maps.LatLng(lat, lng));
    } else {
      // Create a new marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: `Bus ${busId}`,
        icon: "https://maps.google.com/mapfiles/kml/shapes/bus.png",
      });

      busMarkers[busId] = marker;
    }
  });
}
