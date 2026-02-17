import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';  // Importera Leaflet för att hantera marker
import 'leaflet/dist/leaflet.css';  // Importera Leaflet CSS för korrekt rendering

function Map({ latitude, longitude, locationName }) {
  return (
    <div className="map-container">
      <MapContainer center={[latitude, longitude]} zoom={15} style={{ width: '300px', height: '200px', borderRadius: '8px' }}>
        {/* Lägg till OpenStreetMap-tilelayer (fliser) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Lägg till markören för stationen */}
        <Marker position={[latitude, longitude]} icon={new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41] })}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;
